# ARIN Robot Wiring Guide

## Components

| Qty | Component | Notes |
|-----|-----------|-------|
| 1 | Arduino Uno | ATmega328P |
| 1 | L298N Motor Driver | Dual H-Bridge |
| 4 | DC Geared Motors | 4WD chassis (2 Left + 2 Right, wired in parallel per side) |
| 1 | HC-SR04 Ultrasonic | Distance sensor |
| 1 | Passive Buzzer | Active buzzer also works |
| 1 | 12V Battery Pack | Powers L298N motor input |
| 1 | USB-OTG Cable | Arduino USB-B → Phone |

---

## Pin Map

```
Arduino Uno
┌─────────────────────────────┐
│                             │
│  D2 ──────── TRIG (HC-SR04) │
│  D3 ──────── ECHO (HC-SR04) │
│  D4 ──────── BUZZER (+)     │
│  D5 (PWM) ── ENA (L298N)   │
│  D6 ──────── IN1 (L298N)   │
│  D7 ──────── IN2 (L298N)   │
│  D8 ──────── IN3 (L298N)   │
│  D9 ──────── IN4 (L298N)   │
│  D10 (PWM) ─ ENB (L298N)   │
│  D13 ──────── Built-in LED │
│                             │
│  5V ───────── VCC (HC-SR04)│
│  GND ──────── GND (common) │
│  VIN ──────── 5V (L298N)   │
│                             │
│  USB-B ────── OTG Cable    │
└─────────────────────────────┘
```

**Pins 0, 1 are RESERVED** — RX/TX serial to USB. Never connect anything here.

**Pin 13 (Built-in LED)** — Arduino's onboard LED. No external wiring needed. Controlled by the `LED:ON` / `LED:OFF` serial commands.

---

## L298N Motor Driver Wiring

```
L298N Module (4WD Setup — 4 Motors separated into 2 Pairs: Left & Right)
┌────────────────────────────────────────────────────────┐
│                                                        │
│  12V Input ←── Battery (+)                             │
│  GND      ←── Battery (-)                             │
│  5V Output ──→ Arduino VIN                             │
│                                                        │
│  ENA ←────── Arduino D5 (PWM)                          │
│  IN1 ←────── Arduino D6                               │
│  IN2 ←────── Arduino D7                               │
│  IN3 ←────── Arduino D8                               │
│  IN4 ←────── Arduino D9                               │
│  ENB ←────── Arduino D10(PWM)                          │
│                                                        │
│  OUT1 ──────→ Front Left Motor (+)  &  Rear Left Motor (+)  [L Pair]
│  OUT2 ──────→ Front Left Motor (-)  &  Rear Left Motor (-)  [L Pair]
│  OUT3 ──────→ Front Right Motor (+) &  Rear Right Motor (+) [R Pair]
│  OUT4 ──────→ Front Right Motor (-) &  Rear Right Motor (-) [R Pair]
└────────────────────────────────────────────────────────┘
```

**Important:**
- Remove the L298N 5V jumper if powering via 12V battery (L298N's onboard regulator outputs 5V to power Arduino)
- If using a separate 5V supply for Arduino, keep the jumper ON and power Arduino via VIN or 5V pin (NOT both)

---

## HC-SR04 Ultrasonic Sensor

```
HC-SR04
┌─────────────────┐
│  VCC  ←── 5V    │
│  GND  ←── GND   │
│  TRIG ←── D2    │
│  ECHO ←── D3    │
└─────────────────┘
```

Mount facing forward on the robot chassis, clear of obstructions.

---

## Buzzer

```
Passive Buzzer
┌─────────────────┐
│  (+)  ←── D4    │
│  (-)  ←── GND   │
└─────────────────┘
```

For passive buzzer: firmware drives it HIGH for the duration. Active buzzer works too (just on/off, no tone control).

---

## Power Distribution

```
                    ┌──────────────┐
                    │ 12V Battery  │
                    │   Pack       │
                    └──┬───────┬───┘
                       │(+)    │(-)
                       │       │
                       ▼       │
                ┌──────────┐   │
                │ L298N    │   │
                │ 12V IN   │   │
                │ GND ─────┼───┘
                │ 5V OUT ──┼──── Arduino VIN
                └──────────┘
```

**Power flow:**
1. 12V battery → L298N `12V` and `GND` terminals
2. L298N onboard regulator → 5V output → Arduino `VIN` pin
3. Arduino `5V` pin → HC-SR04 `VCC`
4. Common GND between all components

**Battery options:**
- 2× 18650 Li-ion cells (7.4V nominal) — works, L298N handles 6-12V
- 3× AA (4.5V) — too low for L298N, won't work well
- 9V battery — works but limited current for motors
- 12V LiPo (3S) — ideal, provides enough current

---

## USB Connection

### Flash mode (PC → Arduino)
```
Arduino USB-B → USB Cable → PC USB port
```
Use for initial flash and debugging.

### Runtime mode (Phone → Arduino)
```
Arduino USB-B → USB-OTG Cable → Phone USB-C/Micro-USB
```
The ARIN Android app communicates over this link at 115200 baud.

**Never hot-swap USB while Arduino is powered from battery** — always disconnect battery first, then swap USB.

---

## Common Mistakes

| Problem | Fix |
|---------|-----|
| Motors spin wrong direction | Swap motor wires on L298N OUT terminals, or swap IN1/IN2 (or IN3/IN4) in firmware |
| Arduino resets when motors start | Add 100µF capacitor across L298N 12V input and GND (motor current spike causes voltage drop) |
| Ultrasonic gives 0 or -1 | Check wiring — TRIG and ECHO must be on correct pins, sensor needs clear line of sight |
| Buzzer silent | Verify polarity if active buzzer; passive buzzer needs pin 4 HIGH |
| Serial not working | Confirm 115200 baud on both ends; check USB cable is data-capable (not charge-only) |
| Phone doesn't detect Arduino | Use a **data** OTG cable, not a charge-only adapter; Arduino must be powered (via battery or USB) |

---

## Pre-Flash Checklist

- [ ] All motor wires connected to L298N OUT terminals
- [ ] L298N IN1-IN4 connected to Arduino D6-D9
- [ ] L298N ENA/ENB connected to Arduino D5/D10
- [ ] HC-SR04 VCC→5V, GND→GND, TRIG→D2, ECHO→D3
- [ ] Buzzer (+)→D4, (-)→GND
- [ ] Battery (+)→L298N 12V, Battery (-)→L298N GND
- [ ] L298N 5V output → Arduino VIN
- [ ] Common GND between all modules
- [ ] No wires on Arduino pins 0 or 1
- [ ] Arduino connected to PC via USB cable
