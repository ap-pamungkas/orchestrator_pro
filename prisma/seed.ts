import { PrismaClient, ComponentCategory, SlotLayer, WireCategory, ArchitectureMode, Difficulty } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. CLEANUP EXISTING DATA (in reverse dependency order)
  await prisma.codeExplanation.deleteMany();
  await prisma.codeFile.deleteMany();
  await prisma.codeVariation.deleteMany();
  await prisma.wireConnection.deleteMany();
  await prisma.architectureSlot.deleteMany();
  await prisma.architecture.deleteMany();
  await prisma.componentPin.deleteMany();
  await prisma.component.deleteMany();

  console.log("🧹 Cleaned up existing database records.");

  // 2. SEED CONDITIONER COMPONENTS FIRST (to satisfy self-references)
  const direct = await prisma.component.create({
    data: {
      id: "direct",
      name: "Direct",
      category: ComponentCategory.conditioner,
      type: "Direct Bypass",
      description: "Jalur koneksi langsung tanpa pengondisi sinyal untuk mengisi slot add-on ketika tidak diperlukan komponen tambahan.",
      imageUrl: "",
      pinInfo: "Direct Pass (0Ω)",
      statusBadge: "Direct Bypass",
    },
  });

  const resistor220 = await prisma.component.create({
    data: {
      id: "resistor-220",
      name: "220Ω Resistor",
      category: ComponentCategory.conditioner,
      type: "Current Limiter",
      description: "220 Ohm current-limiting resistor required for LED and diode circuits.",
      imageUrl: "/assets/conditioner/resistor.png",
      pinInfo: "Inline Series (220Ω)",
      statusBadge: "LED Protection",
    },
  });

  await prisma.component.create({
    data: {
      id: "resistor-10k",
      name: "10kΩ Resistor",
      category: ComponentCategory.conditioner,
      type: "Pull-up / Pull-down",
      description: "10k Ohm pull-up or pull-down resistor for stable digital logic levels.",
      imageUrl: "/assets/conditioner/resistor.png",
      pinInfo: "Pull-up (10kΩ)",
      statusBadge: "Logic Bias",
    },
  });

  await prisma.component.create({
    data: {
      id: "driver-tc1508a",
      name: "TC1508A Motor Driver",
      category: ComponentCategory.conditioner,
      type: "Dual H-Bridge Driver",
      description: "Dual channel MOSFET H-bridge motor driver module for driving DC motors and stepper motors.",
      imageUrl: "/assets/conditioner/TC1508A.png",
      pinInfo: "INA / INB / Out A-B",
      statusBadge: "Dual H-Bridge",
    },
  });

  console.log("✅ Seeded conditioner components.");

  // 3. SEED INPUT COMPONENTS
  const button = await prisma.component.create({
    data: {
      id: "tactile-button",
      name: "Tactile Button",
      category: ComponentCategory.input,
      type: "Digital Input",
      description: "Momentary tactile push button with pull-up resistor configuration.",
      imageUrl: "/assets/input/tactile_button.png",
      pinInfo: "GPIO 18",
      defaultGpio: "18",
      statusBadge: "Active High/Low",
      pins: {
        create: [
          { pinLabel: "SIG", pinType: "GPIO", defaultGpioNum: "18" },
          { pinLabel: "GND", pinType: "GROUND" },
        ],
      },
    },
  });

  await prisma.component.create({
    data: {
      id: "potentio",
      name: "Potentiometer",
      category: ComponentCategory.input,
      type: "Analog Input",
      description: "Rotary potentiometer providing variable analog resistance voltage.",
      imageUrl: "/assets/input/potentio.png",
      pinInfo: "GPIO 34 (ADC1)",
      defaultGpio: "34",
      statusBadge: "12-bit ADC",
      pins: {
        create: [
          { pinLabel: "VCC", pinType: "POWER" },
          { pinLabel: "OUT", pinType: "ADC", defaultGpioNum: "34" },
          { pinLabel: "GND", pinType: "GROUND" },
        ],
      },
    },
  });

  await prisma.component.create({
    data: {
      id: "dht22",
      name: "DHT22 Sensor",
      category: ComponentCategory.input,
      type: "Digital / 1-Wire",
      description: "Digital humidity and temperature sensor with calibrated signal output.",
      imageUrl: "/assets/input/dht22.png",
      pinInfo: "GPIO 15",
      defaultGpio: "15",
      statusBadge: "Single Bus",
    },
  });

  await prisma.component.create({
    data: {
      id: "infra-red",
      name: "IR Motion Switch",
      category: ComponentCategory.input,
      type: "Digital Input",
      description: "Infrared proximity and obstacle sensor module with digital trigger.",
      imageUrl: "/assets/input/infra_red.png",
      pinInfo: "GPIO 19",
      defaultGpio: "19",
      statusBadge: "Digital Trigger",
    },
  });

  console.log("✅ Seeded input components.");

  // 4. SEED BOARD COMPONENTS
  const esp32 = await prisma.component.create({
    data: {
      id: "esp32",
      name: "ESP32 Core",
      category: ComponentCategory.board,
      type: "30-Pin NodeMCU ESP-WROOM-32",
      description: "Dual-core Tensilica Xtensa 32-bit LX6 MCU with integrated Wi-Fi & BLE.",
      imageUrl: "/assets/board/esp32.png",
      pinInfo: "30 Pins (3.3V Logic)",
      statusBadge: "Primary Controller",
    },
  });

  await prisma.component.create({
    data: {
      id: "esp32-cam",
      name: "ESP32-CAM",
      category: ComponentCategory.board,
      type: "AI-Thinker OV2640 Dev Board",
      description: "ESP32 board with OV2640 camera sensor, microSD slot, and built-in flashlight LED.",
      imageUrl: "/assets/board/esp32-cam.png",
      pinInfo: "16 Pins + Camera Header",
      statusBadge: "Camera & Vision",
    },
  });

  await prisma.component.create({
    data: {
      id: "arduino-uno",
      name: "Arduino Uno R3",
      category: ComponentCategory.board,
      type: "ATmega328P MCU",
      description: "Classic 8-bit AVR microcontroller development board (5V logic).",
      imageUrl: "/assets/board/arduino.png",
      pinInfo: "14 Digital / 6 Analog",
      statusBadge: "Secondary Board",
    },
  });

  await prisma.component.create({
    data: {
      id: "rpi-pico",
      name: "Raspberry Pi Pico",
      category: ComponentCategory.board,
      type: "RP2040 Dual ARM Cortex-M0+",
      description: "Flexible 133MHz dual-core RP2040 micro-controller board with 2MB flash.",
      imageUrl: "/assets/board/rpi_pi_pico.png",
      pinInfo: "40-Pin Header (3.3V Logic)",
      statusBadge: "RP2040 Dual Core",
    },
  });

  console.log("✅ Seeded board components.");

  // 5. SEED OUTPUT COMPONENTS (with self-ref requiredConditionerId)
  const led = await prisma.component.create({
    data: {
      id: "led",
      name: "LED (Red / Blue)",
      category: ComponentCategory.output,
      type: "Digital Output",
      description: "5mm standard light emitting diode. Requires 220Ω current limiting resistor.",
      imageUrl: "/assets/output/led.png",
      pinInfo: "GPIO 2",
      defaultGpio: "2",
      statusBadge: "Needs 220Ω",
      requiredConditionerId: resistor220.id,
      requiredConditionerName: "220Ω Resistor",
      pins: {
        create: [
          { pinLabel: "ANODE (+)", pinType: "GPIO", defaultGpioNum: "2" },
          { pinLabel: "CATHODE (-)", pinType: "GROUND" },
        ],
      },
    },
  });

  await prisma.component.create({
    data: {
      id: "buzzer",
      name: "Active Buzzer",
      category: ComponentCategory.output,
      type: "Digital / PWM Output",
      description: "Piezoelectric audio transducer for acoustic sound generation.",
      imageUrl: "/assets/output/buzzer.png",
      pinInfo: "GPIO 23",
      defaultGpio: "23",
      statusBadge: "PWM / Tone",
    },
  });

  const relay = await prisma.component.create({
    data: {
      id: "relay",
      name: "1-Channel Relay",
      category: ComponentCategory.output,
      type: "Optocoupler Relay",
      description: "5V / 3.3V opto-isolated relay module for high-voltage and high-current AC/DC device switching.",
      imageUrl: "/assets/output/relay.png",
      pinInfo: "GPIO 25",
      defaultGpio: "25",
      statusBadge: "Opto-Isolated",
    },
  });

  await prisma.component.create({
    data: {
      id: "servo",
      name: "SG90 Micro Servo",
      category: ComponentCategory.output,
      type: "PWM Actuator",
      description: "180-degree rotation miniature position-controlled servo motor.",
      imageUrl: "/assets/output/servo.png",
      pinInfo: "GPIO 13",
      defaultGpio: "13",
      statusBadge: "50Hz PWM",
    },
  });

  console.log("✅ Seeded output components.");

  // 6. SEED CODE VARIATIONS WITH CODE FILES & EXPLANATIONS
  await prisma.codeVariation.create({
    data: {
      id: "EX-001",
      componentId: button.id,
      title: "Button → LED ON",
      description: "Turns the LED ON whenever the tactile button is actively pressed.",
      difficulty: Difficulty.Beginner,
      inputCount: 1,
      outputCount: 1,
      command: "Direct State Read",
      setupSummary: "Tactile Button (Input: GPIO 18) ➔ ESP32 (Board) ➔ LED (Output: GPIO 2)",
      logicSummary: "The LED illuminates immediately when the tactile button is held down (LOW signal under pull-up).",
      sourceCode: `// ========================
// INPUT ASSIGN
// ========================
const int BUTTON_PIN = 18;

// ========================
// OUTPUT ASSIGN
// ========================
const int LED_PIN = 2;

// ========================
// SETUP
// ========================
void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}

// ========================
// COMMAND
// ========================
void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  
  if (buttonState == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`,
      files: {
        create: [
          {
            fileName: "main.cpp",
            fileContent: `#include <Arduino.h>\nconst int BUTTON_PIN = 18;\nconst int LED_PIN = 2;\nvoid setup() {\n  pinMode(BUTTON_PIN, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(LED_PIN, digitalRead(BUTTON_PIN) == LOW ? HIGH : LOW);\n}`,
            sortOrder: 0,
          },
          {
            fileName: "config.h",
            fileContent: `#pragma once\n#define BAUDRATE 115200\n#define BUTTON_PIN 18\n#define LED_PIN 2`,
            sortOrder: 1,
          },
        ],
      },
      explanations: {
        create: [
          {
            symbol: "digitalRead(BUTTON_PIN)",
            description: "Senses the electrical logic level on the button pin. A LOW reading indicates contact closure (pressed).",
            sortOrder: 0,
          },
          {
            symbol: "digitalWrite(LED_PIN, HIGH)",
            description: "Supplies 3.3V power to the anode pin of the LED, turning on the emitter diode.",
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await prisma.codeVariation.create({
    data: {
      id: "EX-RELAY-01",
      componentId: relay.id,
      title: "Relay Switch Periodic Toggle",
      description: "Toggles an optocoupler isolated relay on and off with 2-second cycle intervals.",
      difficulty: Difficulty.Beginner,
      inputCount: 0,
      outputCount: 1,
      command: "Relay Control",
      setupSummary: "ESP32 (Board) ➔ Relay (Output: GPIO 25)",
      logicSummary: "Activates the electromagnetic coil on GPIO 25 to close the normally-open (NO) contact.",
      sourceCode: `// ========================
// OUTPUT ASSIGN
// ========================
const int RELAY_PIN = 25;

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
}

void loop() {
  digitalWrite(RELAY_PIN, HIGH);
  delay(2000);
  digitalWrite(RELAY_PIN, LOW);
  delay(2000);
}`,
      files: {
        create: [
          {
            fileName: "main.cpp",
            fileContent: `const int RELAY_PIN = 25;\nvoid setup() { pinMode(RELAY_PIN, OUTPUT); }\nvoid loop() {\n  digitalWrite(RELAY_PIN, HIGH);\n  delay(2000);\n  digitalWrite(RELAY_PIN, LOW);\n  delay(2000);\n}`,
            sortOrder: 0,
          },
        ],
      },
      explanations: {
        create: [
          {
            symbol: "digitalWrite(RELAY_PIN, HIGH)",
            description: "Triggers the optocoupler transistor to energize the relay mechanical switch coil.",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  console.log("✅ Seeded code variations, files, and explanations.");

  // 7. SEED ARCHITECTURE CANVAS SESSION WITH SLOTS & WIRES
  const arch = await prisma.architecture.create({
    data: {
      id: "default-arch-session",
      title: "ESP32 Button to LED Interactive Pipeline",
      mode: ArchitectureMode.educator,
      slots: {
        create: [
          { layer: SlotLayer.input, slotIndex: 0, componentId: button.id },
          { layer: SlotLayer.board, slotIndex: 1, componentId: esp32.id },
          { layer: SlotLayer.output, slotIndex: 0, componentId: led.id },
        ],
      },
      wires: {
        create: [
          {
            fromCategory: WireCategory.input,
            fromSlot: 0,
            toCategory: WireCategory.board,
            toSlot: 1,
            conditionerComponentId: direct.id,
          },
          {
            fromCategory: WireCategory.board,
            fromSlot: 1,
            toCategory: WireCategory.output,
            toSlot: 0,
            conditionerComponentId: resistor220.id,
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded Architecture Canvas: '${arch.title}' with slots and active wires.`);
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
