#!/usr/bin/env python3
"""
ARIN Robot — Motor-Only Serial Test
For the minimal motor controller firmware (arduino_motor/arduino_motor.ino).
Drives individual motors and both-motor movements. Useful for wiring checks
and verifying the LEFT_POWER_FACTOR motor balance.

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


def cmd(ser, text, wait=0.3):
    ser.reset_input_buffer()
    ser.write((text + "\n").encode())
    ser.flush()
    time.sleep(wait)
    drain(ser)


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
    print("   ARIN MOTOR TEST")
    print("================================")
    print("Commands:")
    print("  MOVE:FWD:100 / MOVE:BACK:100")
    print("  TURN:LEFT:100 / TURN:RIGHT:100")
    print("  LEFT:FWD:100 / LEFT:BACK:100")
    print("  RIGHT:FWD:100 / RIGHT:BACK:100")
    print("  STOP")
    print("  STATUS")
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

            if text.upper() == "EXIT":
                break

            cmd(ser, text)

    except KeyboardInterrupt:
        print("\n\nCTRL+C pressed")

    finally:
        cmd(ser, "STOP", wait=0.2)
        ser.close()
        print("\nDisconnected.")


if __name__ == "__main__":
    main()
