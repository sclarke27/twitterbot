
#include <math.h>

int soilSensorPin = 2;
int soilSensorValue = 0;
int tmpSensor1Pin = 1;
int tmpSensor1Value = 0.0;
int lightSensor1Pin = 0;
int lightSensor1Value = 0;


void setup() {
  Serial.begin(115200);
}

int handleTmp36Value(int rawValue) {
  float voltage = rawValue * 5.1;
  voltage /= 1024.0;
  float tempC = (voltage - 0.5) * 100;

  return (round((9.0 / 5.0) * tempC + 32.0));
}

void loop() {
  soilSensorValue = map(analogRead(soilSensorPin), 0, 1000, 0, 100);
  tmpSensor1Value = handleTmp36Value(analogRead(tmpSensor1Pin));
  lightSensor1Value = map(analogRead(lightSensor1Pin), 10, 1010, 0, 100);
  int soilNormalized = map(soilSensorValue, 100, 545, 0, 100);

  String returnString = "{";
  returnString += "\"light\": ";
  returnString += lightSensor1Value;
  returnString += ",\"soil\": ";
  returnString += soilSensorValue;
  returnString += ",\"temp\": ";
  returnString += tmpSensor1Value;
  returnString += "}";
  Serial.println(returnString);

  delay(270);
  
}
