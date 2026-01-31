// M5Atom Lite LINE Beacon example using GreenBeacon library
// Uses GreenBeacon implementation from green-beacon-esp32 (MIT licensed)

#include <Arduino.h>
#include "GreenBeacon.h"
#include <M5Atom.h> // M5Atomライブラリを追加

// Hardware ID must be 10 hex characters (5 bytes). Replace with your device ID.
const String HWID = "018c5d65b7"; // example: 00 11 22 33 44
const String DEVICE_NAME = "illumi-atom-lite";

GreenBeacon beacon;

void setup()
{
    M5.begin(true, false, true); // M5Atom初期化 (シリアル、内蔵IMU無効、LED有効)
    M5.dis.fillpix(0xFFFF00); // Setup in progress...
    // Initialize serial for debug
    Serial.begin(115200);
    delay(100);
    Serial.println("Starting M5Atom Lite LINE Beacon (GreenBeacon)");

    // Initialize beacon
    beacon.init(DEVICE_NAME);
    beacon.setHwid(HWID);
    
    // Adjust detection range to -9dBm (midpoint between -12dBm and -6dBm)
    esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_DEFAULT, ESP_PWR_LVL_N9);
    esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_ADV, ESP_PWR_LVL_N9);
    esp_ble_tx_power_set(ESP_BLE_PWR_TYPE_SCAN, ESP_PWR_LVL_N9);
    
    // Optional: set an initial message (max 13 chars)
    beacon.start("Hello");
    Serial.println("Beacon started");

    M5.dis.fillpix(0x00FF00); // ビーコン開始を視覚的に確認するため、LEDを緑色に点灯
    Serial.println("LED turned green.");
}

void loop()
{
    M5.update(); // M5Atomの更新処理 (ボタン読み取りなど)
    // Nothing required in loop for continuous advertising.
    // If you want to update the message periodically, call beacon.setMessage(...)
    delay(1000);
}
