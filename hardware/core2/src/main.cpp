#include <M5Core2.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "credentials.h"

// By defining DEBUG, detailed logs will be printed to the LCD.
#define DEBUG

#ifdef RED
#undef RED
#endif
#ifdef BLACK
#undef BLACK
#endif

#define FASTLED_INTERNAL
#include <FastLED.h>

#ifndef RED
#define RED 0xF800
#endif
#ifndef BLACK
#define BLACK 0x0000
#endif

// LED Configuration
#define NUM_LEDS 30
#define DATA_PIN 26
#define MAX_COLORS 4
CRGB leds[NUM_LEDS];

// --- State Management ---
struct LedPatternState
{
  String name = "flow";
  CRGB colors[MAX_COLORS];
  int numColors = 1;
  int speed = 1000;
  uint8_t step = 0;
  unsigned long lastUpdate = 0;
};
LedPatternState currentState;
volatile bool patternChanged = false; // Flag to indicate pattern change
unsigned long ledTurnOffTime = 0;     // Global variable to store when to turn off LEDs

// WiFi and MQTT Clients
WiFiClient espClient;
PubSubClient client(espClient);
char mqtt_full_topic[128];

// --- Helper Functions ---
CRGB hexToCRGB(const char *hexColor)
{
  if (!hexColor || hexColor[0] != '#')
    return CRGB::White;
  long number = strtol(&hexColor[1], NULL, 16);
  return CRGB((number >> 16) & 0xFF, (number >> 8) & 0xFF, number & 0xFF);
}

// --- Pattern Handlers ---
void handleBlinkPattern()
{
  if (millis() - currentState.lastUpdate >= currentState.speed)
  {
    currentState.lastUpdate = millis();
    currentState.step = !currentState.step;
    if (currentState.step)
    {
      for (int i = 0; i < NUM_LEDS; i++)
      {
        leds[i] = currentState.colors[i % currentState.numColors];
      }
    }
    else
    {
      fill_solid(leds, NUM_LEDS, CRGB::Black);
    }
    FastLED.show();
  }
}

void handleFlowPattern()
{
  if (millis() - currentState.lastUpdate >= currentState.speed)
  {
    currentState.lastUpdate = millis();
    currentState.step++;
  }
  for (int i = 0; i < NUM_LEDS; i++)
  {
    leds[i] = currentState.colors[(i + currentState.step) % currentState.numColors];
  }
  FastLED.show();
}

// 待機状態用：黄色の明るさグラデーション
void handleWaitingPattern()
{
  // 明るさ一定の黄色
  fill_solid(leds, NUM_LEDS, CRGB::Yellow);
  FastLED.show();
}


// --- Helper Functions ---
uint16_t crgbTo565(CRGB c)
{
  return ((c.r & 0xF8) << 8) | ((c.g & 0xFC) << 3) | (c.b >> 3);
}

// --- Display Functions ---
void drawStatusBar()
{
  M5.Lcd.fillRect(0, 0, 320, 30, 0x001F); // Blue background
  M5.Lcd.setTextColor(WHITE, 0x001F);
  M5.Lcd.setTextSize(2);
  M5.Lcd.setCursor(10, 6);
  M5.Lcd.print("illumi-me");
}

void drawWaitingScreen()
{
  M5.Lcd.fillRect(0, 30, 320, 210, BLACK);
  M5.Lcd.setTextColor(WHITE, BLACK);
  M5.Lcd.setTextSize(3);
  M5.Lcd.setTextDatum(MC_DATUM);
  M5.Lcd.drawString("Waiting...", 160, 100);
  M5.Lcd.setTextSize(2);
  M5.Lcd.drawString("Ready for Beacon", 160, 150);
}

void drawCountdown()
{
  if (ledTurnOffTime == 0) return;
  
  long remaining = (long)(ledTurnOffTime - millis()) / 1000;
  if (remaining < 0) remaining = 0;
  
  char buf[32];
  snprintf(buf, sizeof(buf), "Remaining: %lds", remaining);
  
  M5.Lcd.fillRect(60, 180, 200, 35, BLACK); // Clear specific area
  M5.Lcd.setTextColor(WHITE, BLACK);
  M5.Lcd.setTextSize(2);
  M5.Lcd.setTextDatum(BC_DATUM);
  M5.Lcd.drawString(buf, 160, 210);
}

void drawActiveScreen()
{
  M5.Lcd.fillRect(0, 30, 320, 210, BLACK);

  // Pattern Name
  M5.Lcd.setTextColor(CYAN, BLACK);
  M5.Lcd.setTextSize(3);
  M5.Lcd.setTextDatum(TC_DATUM);
  M5.Lcd.drawString(currentState.name, 160, 50);

  // Color Palette
  if (currentState.numColors > 0)
  {
    int startX = 160 - ((currentState.numColors * 40) / 2);
    for (int i = 0; i < currentState.numColors; i++)
    {
      uint16_t color565 = crgbTo565(currentState.colors[i]);
      int x = startX + i * 40 + 20;
      M5.Lcd.fillCircle(x, 120, 15, color565);
      M5.Lcd.drawCircle(x, 120, 15, WHITE);
    }
  }

  drawCountdown();
}

void updateLedPattern()
{
  if (currentState.name == "blink")
  {
    handleBlinkPattern();
  }
  else if (currentState.name == "flow")
  {
    handleFlowPattern();
  }
  else if (currentState.name == "waiting")
  {
    handleWaitingPattern();
  }
}

// --- WiFi and MQTT Functions ---
void setup_wifi()
{
  delay(10);
  Serial.print("Connecting to WiFi...");
  M5.Lcd.setTextSize(1);
  M5.Lcd.setCursor(10, 220);
  M5.Lcd.print("Connecting to WiFi...");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  M5.Lcd.fillRect(0, 220, 320, 20, BLACK);
  M5.Lcd.setCursor(10, 220);
  M5.Lcd.print("WiFi connected");
  delay(500);
}

void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT...");
    M5.Lcd.setTextSize(1);
    M5.Lcd.setCursor(10, 220);
    M5.Lcd.fillRect(0, 220, 320, 20, BLACK);
    M5.Lcd.print("Attempting MQTT...");
    
    char mqtt_user[128];
    snprintf(mqtt_user, sizeof(mqtt_user), "token:%s", BEEBOTTE_MQTT_TOKEN);
    if (client.connect("M5Core2Client", mqtt_user, NULL))
    {
      Serial.println("\nMQTT connected");
      client.subscribe(mqtt_full_topic);
      Serial.printf("Subscribed to: %s\n", mqtt_full_topic);
      
      M5.Lcd.fillRect(0, 220, 320, 20, BLACK);
      M5.Lcd.setCursor(10, 220);
      M5.Lcd.print("MQTT connected");
      
      // Connection restored, refresh UI
      drawStatusBar();
      drawWaitingScreen();
      
      delay(1000);
    }
    else
    {
      Serial.printf("\nfailed, rc=%d try again in 5s", client.state());
      M5.Lcd.fillRect(0, 220, 320, 20, BLACK);
      M5.Lcd.setCursor(10, 220);
      M5.Lcd.printf("MQTT failed, retry...");
      delay(5000);
    }
  }
}

void callback(char *topic, byte *payload, unsigned int length)
{
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  if (error)
  {
    Serial.printf("Json failed: %s\n", error.c_str());
    return;
  }

  JsonObject data = doc["data"];
  if (data.isNull())
  {
    Serial.println("'data' field missing!");
    return;
  }

  // Reset state and update from payload
  currentState.step = 0;
  currentState.lastUpdate = 0;
  currentState.name = data["pattern"] | "flow";
  currentState.speed = data["speed"] | 500;

  JsonArray colors = data["colors"];
  if (!colors.isNull())
  {
    int i = 0;
    for (JsonVariant v : colors)
    {
      if (i < MAX_COLORS)
      {
        currentState.colors[i++] = hexToCRGB(v.as<const char *>());
      }
    }
    currentState.numColors = i;
  }
  else
  {
    currentState.numColors = 1;
    currentState.colors[0] = CRGB::White;
  }

  patternChanged = true;
  ledTurnOffTime = millis() + 10000; // 10秒後に消灯タイマーセット
}

// --- Arduino Setup and Loop ---

void setup()
{
  M5.begin();
  M5.Lcd.setTextSize(2);
  
  // Draw Initial UI immediately
  drawStatusBar();
  drawWaitingScreen();

  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(32);
  fill_solid(leds, NUM_LEDS, CRGB::Black);
  FastLED.show();

  setup_wifi();

  client.setServer(BEEBOTTE_MQTT_BROKER, BEEBOTTE_MQTT_PORT);
  client.setCallback(callback);

  snprintf(mqtt_full_topic, sizeof(mqtt_full_topic), "%s/%s", BEEBOTTE_CHANNEL, BEEBOTTE_RESOURCE);

  // 初期状態は待機パターン
  currentState.name = "waiting";
  currentState.step = 0;
  currentState.lastUpdate = millis();

  Serial.println("DEBUG: Setup complete, starting waiting pattern");
}

void loop()
{
  M5.update();

  if (!client.connected())
  {
    reconnect();
  }

  client.loop();

  // パターンが変更されたとき（MQTT受信直後）のLCD更新
  // パターンが変更されたとき（MQTT受信直後）のLCD更新
  if (patternChanged)
  {
    drawStatusBar();   // Refresh status bar
    drawActiveScreen(); // Draw active pattern info
    // Logging for debug
#ifdef DEBUG
    M5.Lcd.setCursor(0, 220);
    M5.Lcd.setTextSize(1);
    M5.Lcd.setTextColor(WHITE, BLACK);
    M5.Lcd.printf("Pat: %s Spd: %d", currentState.name.c_str(), currentState.speed);
#endif

    // blinkパターンの初期化
    if (currentState.name == "blink")
    {
      fill_solid(leds, NUM_LEDS, CRGB::Black);
      FastLED.show();
    }
    patternChanged = false;
  }

  // --- 修正箇所: LED消灯ロジック ---

  // タイマーがセットされている場合のみ処理する（ledTurnOffTime > 0）
  if (ledTurnOffTime > 0)
  {
    // 指定時間を過ぎたかチェック
    if (millis() >= ledTurnOffTime)
    {
      // ... (existing turn off logic)
      fill_solid(leds, NUM_LEDS, CRGB::Black);
      FastLED.show();

      ledTurnOffTime = 0;

      drawStatusBar();
      drawWaitingScreen();

      Serial.println("DEBUG: LEDs turned off!");

      currentState.name = "waiting";
      currentState.step = 0;
      currentState.lastUpdate = millis();
    }
    else
    {
      // まだ時間内：LEDパターン更新処理を継続
      updateLedPattern();

      // カウントダウン表示の定期更新（1秒ごと）
      static unsigned long lastCountdownUpdate = 0;
      if (millis() - lastCountdownUpdate >= 1000)
      {
        drawCountdown();
        lastCountdownUpdate = millis();
      }
    }
  }
  // ledTurnOffTime が 0 のときは待機パターンを表示
  else
  {
    // 常に待機パターンを実行
    handleWaitingPattern();
  }

#ifdef DEBUG
  static unsigned long lastDebugPrint = 0;
  if (millis() - lastDebugPrint >= 1000)
  {
    long remaining = (ledTurnOffTime > 0) ? (long)ledTurnOffTime - (long)millis() : 0;
    Serial.printf("DEBUG: ledTurnOffTime=%lu, millis=%lu, remaining=%ld, pattern=%s\n",
                  ledTurnOffTime, millis(), remaining, currentState.name.c_str());
    lastDebugPrint = millis();
  }
#endif
}