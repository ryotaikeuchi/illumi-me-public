#include <M5Core2.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

WiFiClient espClient;
PubSubClient client(espClient);

// コールバック関数のプロトタイプ宣言
void callback(char *topic, byte *payload, unsigned int length);

void setup()
{
    // M5Stack初期化
    M5.begin();
    M5.Lcd.setTextSize(2);
    M5.Lcd.println("Beebotte Test");

    // WiFi接続
    M5.Lcd.println("Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        M5.Lcd.print(".");
    }
    M5.Lcd.println("\nWiFi connected");
    M5.Lcd.println(WiFi.localIP());

    // MQTT設定
    client.setServer(MQTT_SERVER, MQTT_PORT);
    client.setCallback(callback);
}

void loop()
{
    // MQTT接続確認
    if (!client.connected())
    {
        reconnect();
    }
    client.loop();

    // ボタン更新
    M5.update();

    // ボタンAで接続状態表示
    if (M5.BtnA.wasPressed())
    {
        M5.Lcd.fillScreen(BLACK);
        M5.Lcd.setCursor(0, 0);
        M5.Lcd.println("Status:");
        M5.Lcd.printf("WiFi: %s\n", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
        M5.Lcd.printf("MQTT: %s\n", client.connected() ? "Connected" : "Disconnected");
    }

    delay(10);
}

// MQTT再接続処理
void reconnect()
{
    while (!client.connected())
    {
        M5.Lcd.println("Connecting to MQTT...");
        String clientId = "M5Stack-";
        clientId += String(random(0xffff), HEX);

        if (client.connect(clientId.c_str(), MQTT_TOKEN, ""))
        {
            M5.Lcd.println("MQTT connected");
            // トピック購読
            String topic = String(MQTT_CHANNEL) + "/" + String(MQTT_RESOURCE);
            client.subscribe(topic.c_str());
        }
        else
        {
            M5.Lcd.printf("MQTT failed, rc=%d\n", client.state());
            M5.Lcd.println("Retrying in 5 seconds...");
            delay(5000);
        }
    }
}

// MQTTメッセージ受信コールバック
void callback(char *topic, byte *payload, unsigned int length)
{
    // ペイロードをString型に変換
    String message;
    for (int i = 0; i < length; i++)
    {
        message += (char)payload[i];
    }

    // JSONパース用バッファ
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);

    // パースエラー処理
    if (error)
    {
        M5.Lcd.println("JSON parse error");
        return;
    }

    // 画面クリア
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setCursor(0, 0);

    // メッセージ表示
    M5.Lcd.println("Received Message:");
    M5.Lcd.printf("Pattern: %s\n", doc["pattern"].as<const char *>());

    // カラー配列の処理
    JsonArray colors = doc["colors"];
    M5.Lcd.println("Colors:");
    for (JsonVariant color : colors)
    {
        M5.Lcd.println(color.as<const char *>());
    }
}