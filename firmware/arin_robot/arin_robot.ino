/*
 * ARIN Robot Firmware — App-Controlled Serial Protocol (115200 Baud)
 * 
 * Hardware Wiring (4WD 4-Motor Setup — Separated as 2 Left | 2 Right):
 *   - Left Motor Pair (Front Left + Rear Left):   ENA = Pin 5 (PWM), IN1 = Pin 6, IN2 = Pin 7
 *   - Right Motor Pair (Front Right + Rear Right): ENB = Pin 10 (PWM), IN3 = Pin 8, IN4 = Pin 9
 *   - HC-SR04 Ultrasonic:                          TRIG_PIN = Pin 2, ECHO_PIN = Pin 3
 *   - Buzzer:                                      BUZZER_PIN = Pin 4
 *   - Built-in LED:                                Pin 13 (LED_BUILTIN) — onboard
 *   - Serial Connection:                           USB Serial at 115200 Baud (USB-OTG to phone)
 */

// Pin Definitions
const int ENA = 5;
const int IN1 = 6;
const int IN2 = 7;
const int IN3 = 8;
const int IN4 = 9;
const int ENB = 10;

const int TRIG_PIN = 2;
const int ECHO_PIN = 3;
const int BUZZER_PIN = 4;
const int LED_PIN = 13; // Built-in LED

// Safety & Timing Constants
const unsigned long SENSOR_INTERVAL_MS = 100;
const int OBSTACLE_THRESHOLD_CM = 20;
const int OBSTACLE_CLOSE_CM = 10;
const int AVOID_TURN_SPEED = 150;
const int BACKUP_SPEED = 120;
const unsigned long BACKUP_DURATION_MS = 300;
const unsigned long AVOID_TURN_DURATION_MS = 400;

// Left Motor Power Compensation (left motors have higher RPM)
const float LEFT_POWER_FACTOR = 0.80;

// Non-blocking Timer Variables
unsigned long lastSensorTime = 0;
unsigned long buzzerEndTime = 0;
bool buzzerActive = false;

// State Variables
bool isMoving = false;
bool obstacleState = false;
bool ledActive = false;

// Obstacle Avoidance State
bool avoidTurning = false;
bool avoidBackingUp = false;
unsigned long avoidEndTime = 0;
int avoidDirection = 1;    // 1 = turn left, -1 = turn right (alternates)
bool wasMovingForward = false;

// Non-blocking Serial Line Buffer
const size_t BUFFER_SIZE = 64;
char rxBuffer[BUFFER_SIZE];
size_t rxIndex = 0;

// Function Declarations
void motorsStop();
void motorsForward(int speed);
void motorsBackward(int speed);
void turnLeft(int speed);
void turnRight(int speed);
void startBuzzer(unsigned long durationMs);
void updateBuzzer();
void checkObstacle();
void startAvoidTurn();
long readDistanceCm();
void processCommand(char* cmdLine);

void setup() {
  // Boot Fail-Safe: All motor pins and buzzer LOW before Serial init
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(ENA, LOW);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  digitalWrite(ENB, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  // Initialize Serial at 115200 baud
  Serial.begin(115200);
  Serial.println("READY");
}

/*
 * COMMAND PROTOCOL REFERENCE (115200 Baud, \n Terminated)
 * ---------------------------------------------------------------------
 *  Command                   Behavior                     Serial Response
 * ---------------------------------------------------------------------
 *  MOVE:FWD:<speed 0-255>    Drive forward at speed       OK:MOVE:FWD:<speed>
 *  MOVE:BACK:<speed 0-255>   Drive backward at speed      OK:MOVE:BACK:<speed>
 *  TURN:LEFT:<speed 0-255>   Pivot left at speed          OK:TURN:LEFT:<speed>
 *  TURN:RIGHT:<speed 0-255>  Pivot right at speed         OK:TURN:RIGHT:<speed>
 *  STOP                      Stop both motors             OK:STOP
 *  BEEP:<duration_ms>        Pulse buzzer for duration    OK:BEEP:<duration>
 *  LED:ON / LED_ON          Turn on built-in LED (pin 13) OK:LED:ON
 *  LED:OFF / LED_OFF        Turn off built-in LED         OK:LED:OFF
 *  GET_DISTANCE              Ping ultrasonic sensor       DIST:<cm>
 *  GET_STATUS                Query full robot state        STATUS:BUZZER=<ON|OFF>,LED=<ON|OFF>,DISTANCE=<cm>,MOVING=<YES|NO>
 * 
 * Safety Responses (Edge-triggered, non-blocking):
 *  - OBSTACLE:<cm>  Sent ONCE when obstacle (<20cm) stops moving robot
 *  - CLEAR          Sent ONCE when obstacle clears
 *  - ERR:UNKNOWN_CMD:<raw> Sent on malformed command
 */
void loop() {
  unsigned long now = millis();

  // 1. Non-blocking Serial Command Reader
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      if (rxIndex > 0) {
        rxBuffer[rxIndex] = '\0';
        processCommand(rxBuffer);
        rxIndex = 0;
      }
    } else if (rxIndex < BUFFER_SIZE - 1) {
      rxBuffer[rxIndex++] = c;
    }
  }

  // 2. Non-blocking Ultrasonic Safety Check
  if (now - lastSensorTime >= SENSOR_INTERVAL_MS) {
    lastSensorTime = now;
    checkObstacle();
  }

  // 2b. Manage avoidance maneuver timing
  if (avoidBackingUp && millis() >= avoidEndTime) {
    avoidBackingUp = false;
    startAvoidTurn();
  }
  if (avoidTurning && millis() >= avoidEndTime) {
    avoidTurning = false;
  }

  // 3. Non-blocking Buzzer Off Timer
  updateBuzzer();
}

// Process single command line
void processCommand(char* cmdLine) {
  // Trim leading/trailing whitespace
  while (*cmdLine == ' ' || *cmdLine == '\t') cmdLine++;
  int len = strlen(cmdLine);
  while (len > 0 && (cmdLine[len - 1] == ' ' || cmdLine[len - 1] == '\t' || cmdLine[len - 1] == '\r')) {
    cmdLine[--len] = '\0';
  }
  if (len == 0) return;

  // Convert command token to uppercase for parsing
  char copy[BUFFER_SIZE];
  strncpy(copy, cmdLine, BUFFER_SIZE - 1);
  copy[BUFFER_SIZE - 1] = '\0';
  for (int i = 0; copy[i]; i++) {
    copy[i] = toupper(copy[i]);
  }

  if (strcmp(copy, "STOP") == 0) {
    motorsStop();
    Serial.println("OK:STOP");
  }
  else if (strncmp(copy, "MOVE:FWD:", 9) == 0 || strncmp(copy, "MOVE:FWD", 8) == 0) {
    int speed = 200;
    char* colon = strrchr(copy, ':');
    if (colon && colon != copy + 8) speed = atoi(colon + 1);
    speed = constrain(speed, 0, 255);

    // Read distance — if obstacle, begin avoidance immediately
    long dist = readDistanceCm();
    if (dist > 0 && dist < OBSTACLE_THRESHOLD_CM) {
      wasMovingForward = true;
      if (dist < OBSTACLE_CLOSE_CM) {
        motorsBackward(BACKUP_SPEED);
        avoidBackingUp = true;
        avoidEndTime = millis() + BACKUP_DURATION_MS;
        startBuzzer(150);
      } else {
        startAvoidTurn();
      }
      if (!obstacleState) {
        obstacleState = true;
      }
      Serial.print("OBSTACLE:");
      Serial.println(dist);
    } else {
      motorsForward(speed);
      wasMovingForward = true;
      Serial.print("OK:MOVE:FWD:");
      Serial.println(speed);
    }
  }
  else if (strncmp(copy, "MOVE:BACK:", 10) == 0 || strncmp(copy, "MOVE:BACK", 9) == 0) {
    int speed = 200;
    char* colon = strrchr(copy, ':');
    if (colon && colon != copy + 9) speed = atoi(colon + 1);
    speed = constrain(speed, 0, 255);

    motorsBackward(speed);
    Serial.print("OK:MOVE:BACK:");
    Serial.println(speed);
  }
  else if (strncmp(copy, "TURN:LEFT:", 10) == 0 || strncmp(copy, "TURN:LEFT", 9) == 0) {
    int speed = 200;
    char* colon = strrchr(copy, ':');
    if (colon && colon != copy + 9) speed = atoi(colon + 1);
    speed = constrain(speed, 0, 255);

    turnLeft(speed);
    Serial.print("OK:TURN:LEFT:");
    Serial.println(speed);
  }
  else if (strncmp(copy, "TURN:RIGHT:", 11) == 0 || strncmp(copy, "TURN:RIGHT", 10) == 0) {
    int speed = 200;
    char* colon = strrchr(copy, ':');
    if (colon && colon != copy + 10) speed = atoi(colon + 1);
    speed = constrain(speed, 0, 255);

    turnRight(speed);
    Serial.print("OK:TURN:RIGHT:");
    Serial.println(speed);
  }
  else if (strncmp(copy, "BEEP", 4) == 0) {
    int duration = 300;
    char* colon = strrchr(copy, ':');
    if (colon) duration = atoi(colon + 1);
    if (duration <= 0) duration = 300;

    startBuzzer((unsigned long)duration);
    Serial.print("OK:BEEP:");
    Serial.println(duration);
  }
  else if (strcmp(copy, "GET_DISTANCE") == 0) {
    long dist = readDistanceCm();
    Serial.print("DIST:");
    Serial.println(dist);
  }
  else if (strcmp(copy, "LED:ON") == 0 || strcmp(copy, "LED_ON") == 0) {
    digitalWrite(LED_PIN, HIGH);
    ledActive = true;
    Serial.println("OK:LED:ON");
  }
  else if (strcmp(copy, "LED:OFF") == 0 || strcmp(copy, "LED_OFF") == 0) {
    digitalWrite(LED_PIN, LOW);
    ledActive = false;
    Serial.println("OK:LED:OFF");
  }
  else if (strcmp(copy, "GET_STATUS") == 0) {
    long dist = readDistanceCm();
    Serial.print("STATUS:BUZZER=");
    Serial.print(buzzerActive ? "ON" : "OFF");
    Serial.print(",LED=");
    Serial.print(ledActive ? "ON" : "OFF");
    Serial.print(",DISTANCE=");
    Serial.print(dist);
    Serial.print(",MOVING=");
    Serial.println(isMoving ? "YES" : "NO");
  }
  else {
    Serial.print("ERR:UNKNOWN_CMD:");
    Serial.println(cmdLine);
  }
}

// Independent Safety Layer (Autonomous Obstacle Avoidance)
void checkObstacle() {
  long dist = readDistanceCm();
  bool isObstacle = (dist > 0 && dist < OBSTACLE_THRESHOLD_CM);

  if (isObstacle && isMoving && wasMovingForward) {
    if (dist > 0 && dist < OBSTACLE_CLOSE_CM && !avoidTurning && !avoidBackingUp) {
      // Very close: back up first then turn
      motorsBackward(BACKUP_SPEED);
      avoidBackingUp = true;
      avoidTurning = false;
      avoidEndTime = millis() + BACKUP_DURATION_MS;
      startBuzzer(150);
    } else if (!avoidTurning && !avoidBackingUp) {
      // Within threshold but not critical: turn now
      startAvoidTurn();
    }

    if (!obstacleState) {
      obstacleState = true;
      Serial.print("OBSTACLE:");
      Serial.println(dist);
    }
  } else {
    if (obstacleState) {
      obstacleState = false;
      Serial.println("CLEAR");
    }
  }
}

// Begin an avoidance turn (alternates left/right)
void startAvoidTurn() {
  if (avoidDirection == 1) {
    turnLeft(AVOID_TURN_SPEED);
    Serial.println("AVOID:LEFT");
  } else {
    turnRight(AVOID_TURN_SPEED);
    Serial.println("AVOID:RIGHT");
  }
  avoidDirection *= -1; // alternate for next time
  avoidTurning = true;
  avoidEndTime = millis() + AVOID_TURN_DURATION_MS;
}

// Non-blocking HC-SR04 Ultrasonic Distance Ping
long readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 25000); // Max 25ms timeout (~400cm)
  if (duration == 0) return -1;
  return duration / 58; // Convert microseconds to cm
}

// Non-blocking Buzzer Pulse
void startBuzzer(unsigned long durationMs) {
  digitalWrite(BUZZER_PIN, HIGH);
  buzzerEndTime = millis() + durationMs;
  buzzerActive = true;
}

void updateBuzzer() {
  if (buzzerActive && millis() >= buzzerEndTime) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerActive = false;
  }
}

// Motor Control Logic (Matches L298N Hardware Polarity)
void motorsStop() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  isMoving = false;
  wasMovingForward = false;
  avoidTurning = false;
  avoidBackingUp = false;
}

void motorsForward(int speed) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  analogWrite(ENB, speed);
  isMoving = true;
}

void motorsBackward(int speed) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  analogWrite(ENB, speed);
  isMoving = true;
}

void turnLeft(int speed) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  analogWrite(ENB, speed);
  isMoving = true;
}

void turnRight(int speed) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  analogWrite(ENB, speed);
  isMoving = true;
}
