#define ENA 5
#define IN1 6
#define IN2 7
#define IN3 8
#define IN4 9
#define ENB 10

const float LEFT_POWER_FACTOR = 0.80;

String command = "";

void stopMotors() {
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}

void moveForward(int speed) {
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  analogWrite(ENB, speed);

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void moveBackward(int speed) {
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  analogWrite(ENB, speed);

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void turnLeft(int speed) {
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  analogWrite(ENB, speed);

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void turnRight(int speed) {
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  analogWrite(ENB, speed);

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void leftForward(int speed) {
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
}

void leftBackward(int speed) {
  analogWrite(ENA, (int)(speed * LEFT_POWER_FACTOR));
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
}

void rightForward(int speed) {
  analogWrite(ENB, speed);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void rightBackward(int speed) {
  analogWrite(ENB, speed);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void setup() {
  Serial.begin(115200);

  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  stopMotors();

  Serial.println("ARIN MOTOR READY");
}

void loop() {
  if (Serial.available()) {
    command = Serial.readStringUntil('\n');
    command.trim();
    command.toUpperCase();

    processCommand(command);
  }
}

void processCommand(String cmd) {

  if (cmd == "STOP") {
    stopMotors();
    Serial.println("OK:STOP");
  }

  else if (cmd.startsWith("MOVE:FWD:")) {
    int speed = constrain(cmd.substring(9).toInt(), 0, 255);
    moveForward(speed);
    Serial.println("OK:MOVE:FWD");
  }

  else if (cmd.startsWith("MOVE:BACK:")) {
    int speed = constrain(cmd.substring(10).toInt(), 0, 255);
    moveBackward(speed);
    Serial.println("OK:MOVE:BACK");
  }

  else if (cmd.startsWith("TURN:LEFT:")) {
    int speed = constrain(cmd.substring(10).toInt(), 0, 255);
    turnLeft(speed);
    Serial.println("OK:TURN:LEFT");
  }

  else if (cmd.startsWith("TURN:RIGHT:")) {
    int speed = constrain(cmd.substring(11).toInt(), 0, 255);
    turnRight(speed);
    Serial.println("OK:TURN:RIGHT");
  }

  else if (cmd.startsWith("LEFT:FWD:")) {
    int speed = constrain(cmd.substring(9).toInt(), 0, 255);
    leftForward(speed);
    Serial.println("OK:LEFT:FWD");
  }

  else if (cmd.startsWith("LEFT:BACK:")) {
    int speed = constrain(cmd.substring(10).toInt(), 0, 255);
    leftBackward(speed);
    Serial.println("OK:LEFT:BACK");
  }

  else if (cmd.startsWith("RIGHT:FWD:")) {
    int speed = constrain(cmd.substring(10).toInt(), 0, 255);
    rightForward(speed);
    Serial.println("OK:RIGHT:FWD");
  }

  else if (cmd.startsWith("RIGHT:BACK:")) {
    int speed = constrain(cmd.substring(11).toInt(), 0, 255);
    rightBackward(speed);
    Serial.println("OK:RIGHT:BACK");
  }

  else if (cmd == "STATUS") {
    Serial.println("ARIN:MOTOR:READY");
  }

  else {
    Serial.print("ERR:");
    Serial.println(cmd);
  }
}
