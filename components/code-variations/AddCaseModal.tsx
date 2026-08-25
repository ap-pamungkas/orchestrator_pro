import React, { useState, useEffect } from 'react';
import { CodeVariation, DifficultyLevel, ArchitectureState } from '@/types';
import { XIcon, PlusIcon, SparklesIcon, CodeIcon } from '../icons/Icons';

interface AddCaseModalProps {
  isOpen: boolean;
  activeComponentId: string;
  architecture: ArchitectureState;
  currentVariation?: CodeVariation | null;
  onClose: () => void;
  onAddCase: (newCase: CodeVariation) => void;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({
  isOpen,
  activeComponentId,
  architecture,
  currentVariation,
  onClose,
  onAddCase,
}) => {
  const [title, setTitle] = useState('');
  const [command, setCommand] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Beginner');
  const [description, setDescription] = useState('');
  const [logicSummary, setLogicSummary] = useState('');
  const [templateType, setTemplateType] = useState<'pipeline' | 'clone' | 'blank'>('pipeline');
  const [error, setError] = useState<string | null>(null);

  // Derive active inputs & outputs for generating boilerplate
  const activeInput = architecture.inputs.find(Boolean);
  const activeOutput = architecture.outputs.find(Boolean);
  const inputPin = activeInput?.defaultGpio || (activeInput?.id.includes('dht') ? '27' : '18');
  const outputPin = activeOutput?.defaultGpio || '2';

  const isDht = activeInput?.id.toLowerCase().includes('dht') || activeInput?.name.toLowerCase().includes('dht');
  const isAnalog = activeInput?.name.toLowerCase().includes('potenti') || activeInput?.name.toLowerCase().includes('ldr');

  const defaultPipelineCode = isDht
    ? `// ============================================
// ESP32 DHT22 TEMPERATURE & HUMIDITY CASE
// Pipeline: ${activeInput?.name || 'DHT22'} (GPIO ${inputPin}) ➔ ESP32 ➔ ${activeOutput?.name || 'LED'} (GPIO ${outputPin})
// ============================================
#include <DHT.h>

#define DHTPIN ${inputPin}
#define DHTTYPE DHT22
#define ACTUATOR_PIN ${outputPin}

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(ACTUATOR_PIN, OUTPUT);
  Serial.println("DHT22: Sensor initialized successfully.");
}

void loop() {
  float humidity = dht.readHumidity();
  float tempC = dht.readTemperature();

  if (isnan(humidity) || isnan(tempC)) {
    Serial.println("DHT22 Error: Failed to read from sensor!");
    delay(1000);
    return;
  }

  Serial.print("Temp: ");
  Serial.print(tempC);
  Serial.print("°C | Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

  // Threshold trigger: turn on output if temp > 30°C
  if (tempC > 30.0) {
    digitalWrite(ACTUATOR_PIN, HIGH);
  } else {
    digitalWrite(ACTUATOR_PIN, LOW);
  }

  delay(2000);
}
`
    : isAnalog
    ? `// ============================================
// ESP32 ANALOG SENSOR CASE
// Pipeline: ${activeInput?.name || 'Analog In'} (GPIO ${inputPin}) ➔ ESP32 ➔ ${activeOutput?.name || 'Output'} (GPIO ${outputPin})
// ============================================

const int SENSOR_ADC_PIN = ${inputPin};
const int ACTUATOR_PIN = ${outputPin};

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_ADC_PIN, INPUT);
  pinMode(ACTUATOR_PIN, OUTPUT);
  Serial.println("ANALOG: Initialized ADC pin reading.");
}

void loop() {
  int rawValue = analogRead(SENSOR_ADC_PIN); // 0 - 4095 (12-bit ADC)
  float voltage = (rawValue / 4095.0) * 3.3;

  Serial.print("Raw ADC: ");
  Serial.print(rawValue);
  Serial.print(" | Voltage: ");
  Serial.print(voltage);
  Serial.println(" V");

  // Output PWM or digital threshold
  if (rawValue > 2048) {
    digitalWrite(ACTUATOR_PIN, HIGH);
  } else {
    digitalWrite(ACTUATOR_PIN, LOW);
  }

  delay(100);
}
`
    : `// ============================================
// ESP32 CUSTOM LOGIC CASE
// Pipeline: ${activeInput?.name || 'Input'} (GPIO ${inputPin}) ➔ ESP32 ➔ ${activeOutput?.name || 'Output'} (GPIO ${outputPin})
// ============================================

// ========================
// INPUT ASSIGN
// ========================
const int SENSOR_PIN = ${inputPin};

// ========================
// OUTPUT ASSIGN
// ========================
const int ACTUATOR_PIN = ${outputPin};

// STATE VARIABLES
bool systemActive = false;
unsigned long lastEventTime = 0;

// ========================
// SETUP
// ========================
void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  pinMode(ACTUATOR_PIN, OUTPUT);
  Serial.println("SYSTEM: Initialized custom scenario.");
}

// ========================
// COMMAND & LOGIC
// ========================
void loop() {
  int sensorState = digitalRead(SENSOR_PIN);

  // Custom condition: trigger output when sensor is triggered
  if (sensorState == LOW) {
    digitalWrite(ACTUATOR_PIN, HIGH);
    Serial.println("STATUS: SENSOR ACTIVE -> OUTPUT ON");
  } else {
    digitalWrite(ACTUATOR_PIN, LOW);
  }

  delay(20);
}
`;

  const defaultBlankCode = `// ============================================
// ESP32 ARDUINO C++ SKETCH
// ============================================

void setup() {
  Serial.begin(115200);
  // Put your setup code here, to run once:
}

void loop() {
  // Put your main code here, to run repeatedly:
}
`;

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCommand('CUSTOM_SCENARIO');
      setDifficulty('Beginner');
      setDescription('Custom experiment and logic scenario created by user.');
      setLogicSummary('Executes custom user-defined logic pipeline for this hardware configuration.');
      setTemplateType('pipeline');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Case title is required.');
      return;
    }

    const uniqueId = `CASE-CUSTOM-${Date.now().toString().slice(-4)}`;

    let sourceCode = defaultPipelineCode;
    if (templateType === 'clone' && currentVariation) {
      sourceCode = currentVariation.sourceCode;
    } else if (templateType === 'blank') {
      sourceCode = defaultBlankCode;
    }

    const newCase: CodeVariation = {
      id: uniqueId,
      componentId: activeComponentId || 'tactile-button',
      title: title.trim(),
      description: description.trim() || 'Custom test case and code scenario.',
      difficulty,
      inputCount: architecture.inputs.filter(Boolean).length || 1,
      outputCount: architecture.outputs.filter(Boolean).length || 1,
      command: command.trim() || 'CUSTOM_STATE',
      setupSummary: `${activeInput?.name || 'Input'} (GPIO ${inputPin}) ➔ ESP32 ➔ ${activeOutput?.name || 'Output'} (GPIO ${outputPin})`,
      logicSummary: logicSummary.trim() || 'Custom user scenario.',
      codeExplanation: [
        {
          symbol: `GPIO ${inputPin} & GPIO ${outputPin}`,
          description: 'Custom hardware mapping assigned for this learning scenario.',
        },
      ],
      sourceCode,
      isCustom: true,
      files: [
        {
          name: 'sketch.ino',
          content: sourceCode,
        },
      ],
    };

    onAddCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <CodeIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 leading-tight">
                Create Custom Code Case / Scenario
              </h2>
              <p className="text-[11px] text-zinc-500">
                Add your own custom test case, logic scenario, or experiment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Title & Command Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 mb-1">
                Case Title *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Button Hold 3s ➔ Rapid Alarm Blink"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Command / Tag
              </label>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g. HOLD_TIMER"
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Difficulty Level Tabs */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5 uppercase text-[10px] tracking-wider font-mono">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'Beginner', color: 'emerald' },
                  { id: 'Intermediate', color: 'amber' },
                  { id: 'Advanced', color: 'purple' },
                ] as const
              ).map((lvl) => {
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id)}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? lvl.id === 'Beginner'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-100'
                          : lvl.id === 'Intermediate'
                          ? 'bg-amber-50 text-amber-800 border-amber-400 ring-2 ring-amber-100'
                          : 'bg-purple-50 text-purple-800 border-purple-400 ring-2 ring-purple-100'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {lvl.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starter Template Selection */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5 uppercase text-[10px] tracking-wider font-mono">
              Starter Code Template
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('pipeline')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col ${
                  templateType === 'pipeline'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-100'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-zinc-800 text-[11px]">
                  <SparklesIcon className="w-3 h-3 text-blue-600" />
                  <span>From Pipeline</span>
                </div>
                <span className="text-[9px] text-zinc-400 mt-0.5 leading-tight">
                  Auto-mapped with active Input & Output pins
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('clone')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col ${
                  templateType === 'clone'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-100'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-zinc-800 text-[11px]">
                  <CodeIcon className="w-3 h-3 text-zinc-600" />
                  <span>Clone Active</span>
                </div>
                <span className="text-[9px] text-zinc-400 mt-0.5 leading-tight">
                  Copy existing variation as base
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('blank')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col ${
                  templateType === 'blank'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-100'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-zinc-800 text-[11px]">
                  <span>📄</span>
                  <span>Blank Sketch</span>
                </div>
                <span className="text-[9px] text-zinc-400 mt-0.5 leading-tight">
                  Clean setup() and loop() skeleton
                </span>
              </button>
            </div>
          </div>

          {/* Description & Educational Notes */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Case Description & Learning Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what this scenario accomplishes..."
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Create Case</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
