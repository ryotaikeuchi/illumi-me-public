#ifndef CONFIG_H
#define CONFIG_H

// WiFi設定
const char *WIFI_SSID = "your-ssid";
const char *WIFI_PASSWORD = "your-password";

// Beebotte設定
const char *MQTT_SERVER = "mqtt.beebotte.com";
const int MQTT_PORT = 1883;
const char *MQTT_TOKEN = "your-token";
const char *MQTT_CHANNEL = "led_control";
const char *MQTT_RESOURCE = "commands";

#endif