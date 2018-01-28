

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>

int soilSensor1Pin = 0;
int soilSensor1Value = 0;
int lightSensor1Pin = 1;
int lightSensor1Value = 0;
int valueSoilBuffer[10];
int lastSoilBufferValue = 0;
int valueLightBuffer[10];
int lastLightBufferValue = 0;
int pressureValue = 0;
int tempuratureValue = 0;
int altitudeValue = 0;
int lastPressureValue = 0;
int lastTempuratureValue = 0;
int lastAltitudeValue = 0;

Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);

void setup() {
  Serial.begin(9600);
  if(!bmp.begin()) {
    Serial.println("Error starting BMP085");
  }
}

void loop() {
  soilSensor1Value = analogRead(soilSensor1Pin);
  lightSensor1Value = analogRead(lightSensor1Pin);

  sensors_event_t event;
  bmp.getEvent(&event);
  if (event.pressure)
  {
    pressureValue = event.pressure;
    float temp;
    bmp.getTemperature(&temp);
    tempuratureValue = ((9.0/5.0)*temp+32.0);
    float seaLevelPressure = SENSORS_PRESSURE_SEALEVELHPA;
    altitudeValue = bmp.pressureToAltitude(seaLevelPressure, event.pressure); 
    
  }

  int lightDeltaBuffer = 15;
  int soilDeltaBuffer = 10;
  int pressureDeltaBuffer = 3;
  int tempDeltaBuffer = 3;
  if(lastSoilBufferValue != soilSensor1Value || lastLightBufferValue != lightSensor1Value || lastPressureValue != pressureValue) {
    int soilDelta = lastSoilBufferValue - soilSensor1Value;
    int lightDelta = lastLightBufferValue - lightSensor1Value;
    int pressureDelta = lastPressureValue - pressureValue;
    int tempDelta = lastPressureValue - pressureValue;
    if((lightDelta >= lightDeltaBuffer || lightDelta <= (lightDeltaBuffer *-1)) 
    || (soilDelta >= soilDeltaBuffer || soilDelta <= (soilDeltaBuffer *-1)) 
    || (pressureDelta >= pressureDeltaBuffer || pressureDelta <= (pressureDeltaBuffer *-1))
    || (tempDelta >= tempDeltaBuffer || tempDelta <= (tempDeltaBuffer *-1)) ) {
      String returnString = "{\"moisture\": ";
      returnString += soilSensor1Value;
      returnString += ",\"light\": ";
      returnString += lightSensor1Value;
      returnString += ",\"pressure\": ";
      returnString += pressureValue;
      returnString += ",\"temperature\": ";
      returnString += tempuratureValue;
      returnString += "}";
      Serial.println(returnString);
      lastSoilBufferValue = soilSensor1Value;
      lastLightBufferValue = lightSensor1Value;
      lastPressureValue = pressureValue;
      lastTempuratureValue = tempuratureValue;
    }
  }
  delay(100);
}
