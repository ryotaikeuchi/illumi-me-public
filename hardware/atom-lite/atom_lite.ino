// M5Atom Lite LINE Beacon example using GreenBeacon library
// Uses GreenBeacon implementation from green-beacon-esp32 (MIT licensed)

#include <Arduino.h>
#include "src/GreenBeacon.h"

// Hardware ID must be 10 hex characters (5 bytes). Replace with your device ID.
const String HWID = "018bf828ca"; // example: 00 11 22 33 44
const String DEVICE_NAME = "illumi-atom-lite";

GreenBeacon beacon;

void setup()
{
    // Initialize serial for debug
    Serial.begin(115200);
    delay(100);
    Serial.println("Starting M5Atom Lite LINE Beacon (GreenBeacon)");

    // Initialize beacon
    beacon.init(DEVICE_NAME);
    beacon.setHwid(HWID);
    // Optional: set an initial message (max 13 chars)
    beacon.start("Hello");
    Serial.println("Beacon started");
}

void loop()
{
    // Nothing required in loop for continuous advertising.
    // If you want to update the message periodically, call beacon.setMessage(...)
    delay(1000);
}
