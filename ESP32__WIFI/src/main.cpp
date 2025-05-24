#include <WiFi.h>
#include <WebSocketsServer.h>
#include <Arduino.h>
#include <ESP32Servo.h>

namespace PinConfig
{
    // configuration des pins pour le robot sur le esp32 sur 8bit unsigned 
    constexpr uint8_t PWMA_OUT = 25;
    constexpr uint8_t PWMB_OUT = 26;
    constexpr uint8_t pinLB = 4;
    constexpr uint8_t pinRB = 5;
    constexpr uint8_t pinLF = 18;
    constexpr uint8_t pinRF = 19;
    constexpr uint8_t Echo_Pin = 14;
    constexpr uint8_t Trig_Pin = 12;
    constexpr uint8_t SERVO_PIN = 13;
    constexpr uint8_t canalA = 0;
    constexpr uint8_t canalB = 1;
}

namespace WiFiConfig
{
    const char *ssid = "ESP32_MRZ";
    const char *password = "mrz12345"; 
}

enum class Direction
{
    FORWARD,
    BACKWARD,
    LEFT,
    RIGHT,
    STOP
};

struct RobotState
{
    int angle = 90;
    int currentAngle = 0;
    bool increasing = true;
    long distance = 0;
    int vitesse = 0;
    bool modeAuto = false;
    bool envoiRadar = false;
    unsigned long lastMove = 0;
    const unsigned long delayMove = 30;
};

RobotState robotState;
Servo radarServo;
WebSocketsServer webSocket(81);

void controlMotors(Direction dir, int speed)
{
    speed = constrain(speed, 0, 255);

    digitalWrite(PinConfig::pinLF, (dir == Direction::FORWARD || dir == Direction::RIGHT) ? HIGH : LOW);
    digitalWrite(PinConfig::pinLB, (dir == Direction::BACKWARD || dir == Direction::LEFT) ? HIGH : LOW);
    digitalWrite(PinConfig::pinRF, (dir == Direction::FORWARD || dir == Direction::LEFT) ? HIGH : LOW);
    digitalWrite(PinConfig::pinRB, (dir == Direction::BACKWARD || dir == Direction::RIGHT) ? HIGH : LOW);
    if (dir == Direction::STOP)
    {
        digitalWrite(PinConfig::pinLF, LOW);
        digitalWrite(PinConfig::pinLB, LOW);
        digitalWrite(PinConfig::pinRF, LOW);
        digitalWrite(PinConfig::pinRB, LOW);
        speed = 0;
    }

    ledcWrite(PinConfig::canalA, speed);
    ledcWrite(PinConfig::canalB, speed);

    Serial.printf("Direction: %d, Vitesse: %d\n", static_cast<int>(dir), speed);
}

void updateServoAngle()
{
    if (robotState.increasing)
    {
        if (++robotState.angle >= 175)
        {
            robotState.angle = 175;
            robotState.increasing = false;
        }
    }
    else
    {
        if (--robotState.angle <= 5)
        {
            robotState.angle = 5;
            robotState.increasing = true;
        }
    }
    radarServo.write(robotState.angle);
}

#define TEST 0
void measureDistance()
{
#ifdef TEST
    robotState.distance = random(5, 101);
#else
    digitalWrite(PinConfig::Trig_Pin, LOW);
    delayMicroseconds(2);
    digitalWrite(PinConfig::Trig_Pin, HIGH);
    delayMicroseconds(10);
    digitalWrite(PinConfig::Trig_Pin, LOW);

    long duration = pulseIn(PinConfig::Echo_Pin, HIGH, 30000);
    robotState.distance = duration > 0 ? min(duration * 0.034 / 2, 81.0) : 81;
#endif
}

void handleWebSocketMessage(uint8_t num, const String &msg)
{
    Serial.println("Reçu : " + msg);

    if (msg == "F")
    {
        controlMotors(Direction::FORWARD, robotState.vitesse);
    }
    else if (msg == "B")
    {
        controlMotors(Direction::BACKWARD, robotState.vitesse);
    }
    else if (msg == "L")
    {
        controlMotors(Direction::LEFT, robotState.vitesse);
    }
    else if (msg == "R")
    {
        controlMotors(Direction::RIGHT, robotState.vitesse);
    }
    else if (msg == "S")
    {
        controlMotors(Direction::STOP, 0);
        robotState.vitesse = 0;
    }
    else if (msg.startsWith("V"))
    {
        robotState.vitesse = constrain(map(msg.substring(1).toInt(), 0, 100, 0, 255), 0, 255);
    }
    else if (msg == "AUTO_OFF")
    {
        robotState.modeAuto = false;
    }
    else if (msg == "AUTO")
    {
        robotState.modeAuto = true;
    }
    else if (msg.startsWith("M"))
    {
        robotState.angle = constrain(msg.substring(1).toInt(), 0, 180);
        radarServo.write(robotState.angle);
    }
}

void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t len)
{
    switch (type)
    {
    case WStype_CONNECTED:
        Serial.println("Client Web connecté ");
        break;

    case WStype_TEXT:
        handleWebSocketMessage(num, String((char *)payload));
        break;

    default:
        break;
    }
}

void setup()
{
    Serial.begin(115200);
    Serial.println("Démarrage...");

    radarServo.attach(PinConfig::SERVO_PIN, 500, 2400);
    radarServo.write(robotState.angle);

    WiFi.softAP(WiFiConfig::ssid, WiFiConfig::password);
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());

    webSocket.begin();
    webSocket.onEvent(onWebSocketEvent);
    Serial.println("WebSocket prêt.");

    pinMode(PinConfig::pinLF, OUTPUT);
    pinMode(PinConfig::pinLB, OUTPUT);
    pinMode(PinConfig::pinRF, OUTPUT);
    pinMode(PinConfig::pinRB, OUTPUT);

    ledcSetup(PinConfig::canalA, 1000, 8);
    ledcAttachPin(PinConfig::PWMA_OUT, PinConfig::canalA);
    ledcSetup(PinConfig::canalB, 1000, 8);
    ledcAttachPin(PinConfig::PWMB_OUT, PinConfig::canalB);

    pinMode(PinConfig::Trig_Pin, OUTPUT);
    pinMode(PinConfig::Echo_Pin, INPUT);
}

void loop()
{
    webSocket.loop();

    static unsigned long lastSend = 0;
    if (millis() - lastSend > 80)
    {
        if (robotState.modeAuto)
        {
            updateServoAngle();
        }
        measureDistance();

        String msg = "ANGLE:" + String(robotState.angle) + " DIST:" + String(robotState.distance);
        webSocket.broadcastTXT(msg);
        lastSend = millis();
    }

    delay(10);

}