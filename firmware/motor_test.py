#!/usr/bin/env python3
"""
ARIN Robot — Serial Test/Debug Tool
Connects to the Arduino over USB serial and lets you drive the robot,
query the ultrasonic sensor, buzz, test the LED, and exercise obstacle
avoidance. Works with the full firmware (firmware/arin_robot/arin_robot.ino).

Requires: pip install pyserial
Usage:    python3 firmware/motor_test.py [PORT] [BAUD]
"""

import sys
import time

import serial

DEFAULT_PORT = "/dev/ttyUSB0"
DEFAULT_BAUD = 115200


def drain(ser):
    while ser.in_waiting:
        line = ser.readline().decode(errors="ignore").strip()
        if line:
            print("Arduino >", line)


def cmd(ser, text, wait=0.4):
    ser.reset_input_buffer()
    ser.write((text + "\n").encode())
    ser.flush()
    time.sleep(wait)
    drain(ser)


def clamp_speed(value):
    try:
        speed = int(value)
    except (TypeError, ValueError):
        return 200
    return min(255, max(0, speed))


def main():
    port = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PORT
    baud = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_BAUD

    print(f"Connecting to {port} at {baud}...")

    try:
        ser = serial.Serial(port, baud, timeout=1)
    except serial.SerialException as e:
        print(f"\nSerial Error: {e}")
        print(f"Check that the Arduino is connected to {port}")
        return

    time.sleep(2)  # Arduino resets on serial open
    drain(ser)

    print("\n================================")
    print("   ARIN ROBOT SERIAL CONTROLLER")
    print("================================")
    print("Commands:")
    print("  MOVE:FWD:150        Forward (obstacle auto-avoid turns L/R)")
    print("  MOVE:BACK:150       Backward")
    print("  TURN:LEFT:150 / TURN:RIGHT:150")
    print("  STOP")
    print("  GET_DISTANCE        Ping ultrasonic sensor")
    print("  GET_STATUS          Full robot state")
    print("  BEEP:500            Buzz 500ms")
    print("  LED:ON / LED:OFF")
    print("  EXIT\n")

    try:
        while True:
            try:
                text = input("ARIN > ").strip()
            except EOFError:
                print("\nInput closed.")
                break

            if not text:
                continue

            upper = text.upper()

            if upper == "EXIT":
                break

            # Normalize motor commands: constrain speed to 0-255
            if upper.startswith("MOVE:") or upper.startswith("TURN:"):
                parts = upper.split(":")
                if len(parts) == 3:
                    text = f"{parts[0]}:{parts[1]}:{clamp_speed(parts[2])}"

            cmd(ser, text)

    except KeyboardInterrupt:
        print("\n\nCTRL+C pressed")

    finally:
        cmd(ser, "STOP", wait=0.2)
        ser.close()
        print("\nDisconnected.")


if __name__ == "__main__":
    main()
