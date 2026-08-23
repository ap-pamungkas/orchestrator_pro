import { CodeVariation } from '@/types';

export const CODE_VARIATIONS: CodeVariation[] = [
  // VARIATIONS FOR TACTILE BUTTON
  {
    id: 'EX-001',
    componentId: 'tactile-button',
    title: 'Button → LED ON',
    description: 'Turns the LED ON whenever the tactile button is actively pressed.',
    difficulty: 'Beginner',
    inputCount: 1,
    outputCount: 1,
    command: 'Direct State Read',
    setupSummary: 'Tactile Button (Input: GPIO 18) ➔ ESP32 (Board) ➔ LED (Output: GPIO 2)',
    logicSummary: 'The LED illuminates immediately when the tactile button is held down (LOW signal under pull-up).',
    codeExplanation: [
      {
        symbol: 'digitalRead(BUTTON_PIN)',
        description: 'Senses the electrical logic level on the button pin. A LOW reading indicates contact closure (pressed).',
      },
      {
        symbol: 'digitalWrite(LED_PIN, HIGH)',
        description: 'Supplies 3.3V power to the anode pin of the LED, turning on the emitter diode.',
      },
    ],
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
  },
  {
    id: 'EX-002',
    componentId: 'tactile-button',
    title: 'Button → LED ON/OFF',
    description: 'Explicit if-else logic to hold LED state with serial monitor debug logging.',
    difficulty: 'Beginner',
    inputCount: 1,
    outputCount: 1,
    command: 'Conditional Logic',
    setupSummary: 'Tactile Button (Input: GPIO 18) ➔ ESP32 (Board) ➔ LED (Output: GPIO 2)',
    logicSummary: 'Reads input pin and branches logic to drive the output pin while streaming telemetry via UART.',
    codeExplanation: [
      {
        symbol: 'INPUT_PULLUP',
        description: 'Activates the internal 45kΩ pull-up resistor on ESP32 GPIO 18 to ensure a stable HIGH when idle.',
      },
      {
        symbol: 'Serial.println()',
        description: 'Transmits real-time button actuation events over USB-UART to the host serial terminal.',
      },
    ],
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
  if (digitalRead(BUTTON_PIN) == LOW) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("STATUS: BUTTON_PRESSED -> LED_ON");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("STATUS: BUTTON_RELEASED -> LED_OFF");
  }
  delay(50);
}`,
  },
  {
    id: 'EX-003',
    componentId: 'tactile-button',
    title: 'Button → LED Toggle',
    description: 'Toggle LED state on single button press with software debounce filter.',
    difficulty: 'Intermediate',
    inputCount: 1,
    outputCount: 1,
    command: 'State Toggle & Debounce',
    setupSummary: 'Tactile Button (Input: GPIO 18) ➔ ESP32 (Board) ➔ LED (Output: GPIO 2)',
    logicSummary: 'Stores persistent LED toggle state in memory, inverting output logic on falling-edge press events.',
    codeExplanation: [
      {
        symbol: 'lastButtonState != currentState',
        description: 'Detects state edge transition (high-to-low press event) rather than level holding.',
      },
      {
        symbol: 'ledState = !ledState',
        description: 'Inverts the boolean state variable controlling the LED output pin.',
      },
    ],
    sourceCode: `// ========================
// INPUT ASSIGN
// ========================
const int BUTTON_PIN = 18;

// ========================
// OUTPUT ASSIGN
// ========================
const int LED_PIN = 2;

// STATE VARIABLES
bool ledState = false;
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

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
  int reading = digitalRead(BUTTON_PIN);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading == LOW && lastButtonState == HIGH) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
      Serial.println(ledState ? "TOGGLE: ON" : "TOGGLE: OFF");
    }
  }

  lastButtonState = reading;
}`,
  },
  {
    id: 'EX-004',
    componentId: 'tactile-button',
    title: 'Button → LED Blink',
    description: 'Triggers non-blocking rhythmic LED blinking while button is pressed.',
    difficulty: 'Intermediate',
    inputCount: 1,
    outputCount: 1,
    command: 'Non-Blocking Millis',
    setupSummary: 'Tactile Button (Input: GPIO 18) ➔ ESP32 (Board) ➔ LED (Output: GPIO 2)',
    logicSummary: 'Uses system timestamp difference (millis) to alternate LED state at 200ms intervals without blocking delay.',
    codeExplanation: [
      {
        symbol: 'millis()',
        description: 'Returns the number of milliseconds elapsed since the ESP32 board began running the current sketch.',
      },
      {
        symbol: 'Non-blocking loop',
        description: 'Allows background tasks, serial polling, and sensor reads to continue without CPU delay lock.',
      },
    ],
    sourceCode: `// ========================
// INPUT ASSIGN
// ========================
const int BUTTON_PIN = 18;

// ========================
// OUTPUT ASSIGN
// ========================
const int LED_PIN = 2;

unsigned long previousMillis = 0;
const long interval = 200;
bool ledState = false;

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
  if (digitalRead(BUTTON_PIN) == LOW) {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= interval) {
      previousMillis = currentMillis;
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    }
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`,
  },
  {
    id: 'EX-005',
    componentId: 'tactile-button',
    title: 'Button → LED Timer',
    description: 'Press button to turn ON LED for a timed 3-second auto-shutoff duration.',
    difficulty: 'Advanced',
    inputCount: 1,
    outputCount: 1,
    command: 'Timer Auto-Off',
    setupSummary: 'Tactile Button (Input: GPIO 18) ➔ ESP32 (Board) ➔ LED (Output: GPIO 2)',
    logicSummary: 'Starts an asynchronous 3000ms countdown timer upon trigger, automatically deactivating the LED output.',
    codeExplanation: [
      {
        symbol: 'timerActive flag',
        description: 'State machine tracker indicating an active timed cycle in progress.',
      },
      {
        symbol: 'currentMillis - startTime >= 3000',
        description: 'Precision hardware timestamp comparison to safely expire the activation period.',
      },
    ],
    sourceCode: `// ========================
// INPUT ASSIGN
// ========================
const int BUTTON_PIN = 18;

// ========================
// OUTPUT ASSIGN
// ========================
const int LED_PIN = 2;

unsigned long timerStart = 0;
const unsigned long RUN_TIME = 3000;
bool isTimerRunning = false;

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
  if (digitalRead(BUTTON_PIN) == LOW && !isTimerRunning) {
    isTimerRunning = true;
    timerStart = millis();
    digitalWrite(LED_PIN, HIGH);
    Serial.println("TIMER: Started (3000ms)");
  }

  if (isTimerRunning && (millis() - timerStart >= RUN_TIME)) {
    isTimerRunning = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("TIMER: Expired -> LED Turned OFF");
  }
}`,
  },

  // VARIATIONS FOR LED OUTPUT
  {
    id: 'EX-LED-01',
    componentId: 'led',
    title: 'LED Basic Pulse',
    description: 'Standard 1Hz periodic square wave digital toggle for visual status.',
    difficulty: 'Beginner',
    inputCount: 0,
    outputCount: 1,
    command: 'Periodic Pulse',
    setupSummary: 'ESP32 (Board) ➔ LED (Output: GPIO 2)',
    logicSummary: 'Toggles GPIO 2 HIGH for 500ms and LOW for 500ms continuously.',
    codeExplanation: [
      {
        symbol: 'pinMode(LED_PIN, OUTPUT)',
        description: 'Configures ESP32 GPIO 2 pad buffer for low-impedance voltage output.',
      },
    ],
    sourceCode: `// ========================
// OUTPUT ASSIGN
// ========================
const int LED_PIN = 2;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}`,
  },
  {
    id: 'EX-LED-02',
    componentId: 'led',
    title: 'LED PWM Smooth Breathing',
    description: 'Modulates duty cycle with LEDC hardware PWM generator for soft fading.',
    difficulty: 'Intermediate',
    inputCount: 0,
    outputCount: 1,
    command: 'LEDC PWM Modulation',
    setupSummary: 'ESP32 (Board) ➔ LED (Output: GPIO 2)',
    logicSummary: 'Sweeps PWM duty cycle from 0 to 255 with 5kHz frequency.',
    codeExplanation: [
      {
        symbol: 'ledcAttachChannel()',
        description: 'Assigns hardware timer channel to drive pin with high resolution analog-like duty cycle.',
      },
    ],
    sourceCode: `// ========================
// OUTPUT ASSIGN
// ========================
const int LED_PIN = 2;
const int PWM_CHANNEL = 0;
const int FREQ = 5000;
const int RESOLUTION = 8;

void setup() {
  ledcAttach(LED_PIN, FREQ, RESOLUTION);
}

void loop() {
  for (int duty = 0; duty <= 255; duty++) {
    ledcWrite(LED_PIN, duty);
    delay(5);
  }
  for (int duty = 255; duty >= 0; duty--) {
    ledcWrite(LED_PIN, duty);
    delay(5);
  }
}`,
  },
];
