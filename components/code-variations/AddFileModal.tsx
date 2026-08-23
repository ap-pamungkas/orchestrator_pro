import React, { useState, useEffect } from 'react';
import { XIcon, FilePlusIcon, SparklesIcon, FileCodeIcon } from '../icons/Icons';

interface AddFileModalProps {
  isOpen: boolean;
  targetCaseTitle?: string;
  existingFileNames: string[];
  onClose: () => void;
  onAddFile: (fileName: string, initialContent?: string) => void;
}

const FILE_SUGGESTIONS = [
  {
    name: 'pins.h',
    desc: 'Pin mapping constants and hardware definitions',
    template: `// ============================================
// HARDWARE PIN DEFINITIONS (pins.h)
// ============================================
#pragma once

#define PIN_BUTTON_1    18
#define PIN_BUTTON_2    19
#define PIN_LED_RED     2
#define PIN_LED_BLUE    4
#define PIN_BUZZER      23
#define PIN_ANALOG_POT  34
`,
  },
  {
    name: 'config.h',
    desc: 'System parameters, timings, and configuration',
    template: `// ============================================
// SYSTEM CONFIGURATION (config.h)
// ============================================
#pragma once

const unsigned long DEBOUNCE_DELAY_MS = 50;
const unsigned long BLINK_INTERVAL_MS = 250;
const unsigned long AUTO_SHUTOFF_MS   = 3000;
const int SERIAL_BAUD_RATE           = 115200;
`,
  },
  {
    name: 'secrets.h',
    desc: 'Wi-Fi credentials & API tokens template',
    template: `// ============================================
// NETWORK SECRETS (secrets.h)
// ============================================
#pragma once

#define WIFI_SSID     "ESP32_Learning_Lab"
#define WIFI_PASSWORD "esp32securePass"
#define MQTT_SERVER   "broker.hivemq.com"
#define MQTT_PORT     1883
`,
  },
  {
    name: 'custom_logic.cpp',
    desc: 'Modular helper functions and business logic',
    template: `// ============================================
// MODULAR LOGIC IMPLEMENTATION (custom_logic.cpp)
// ============================================
#include <Arduino.h>

void triggerAlarmBeep(int buzzerPin, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(buzzerPin, HIGH);
    delay(100);
    digitalWrite(buzzerPin, LOW);
    delay(100);
  }
}
`,
  },
];

export const AddFileModal: React.FC<AddFileModalProps> = ({
  isOpen,
  targetCaseTitle,
  existingFileNames,
  onClose,
  onAddFile,
}) => {
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFileName('');
      setFileContent('');
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

  const handleSelectSuggestion = (sug: typeof FILE_SUGGESTIONS[0]) => {
    setFileName(sug.name);
    setFileContent(sug.template);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let cleanName = fileName.trim();
    if (!cleanName) {
      setError('File name is required.');
      return;
    }

    // Auto-append .h if no extension provided
    if (!cleanName.includes('.')) {
      cleanName = `${cleanName}.h`;
    }

    // Sanitize characters
    cleanName = cleanName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Duplicate check (case-insensitive)
    if (existingFileNames.some((f) => f.toLowerCase() === cleanName.toLowerCase())) {
      setError(`File "${cleanName}" already exists in this sketch.`);
      return;
    }

    // Default template if content is blank
    let finalContent = fileContent;
    if (!finalContent) {
      if (cleanName.endsWith('.h') || cleanName.endsWith('.hpp')) {
        finalContent = `// ============================================\n// ${cleanName}\n// ============================================\n#pragma once\n\n// Add header declarations here...\n`;
      } else {
        finalContent = `// ============================================\n// ${cleanName}\n// ============================================\n#include <Arduino.h>\n\n// Add source implementation here...\n`;
      }
    }

    onAddFile(cleanName, finalContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FilePlusIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-xs text-zinc-900 leading-tight">
                Create New File / Header
              </h2>
              <p className="text-[10px] text-zinc-500 truncate max-w-[280px]">
                {targetCaseTitle ? `Adding to case: "${targetCaseTitle}"` : 'Add modular source files or header definitions to your sketch.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] font-medium flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Common Suggestions */}
          <div>
            <div className="flex items-center gap-1 text-[10.5px] font-semibold text-zinc-500 mb-1.5">
              <SparklesIcon className="w-3 h-3 text-amber-500" />
              <span>Suggested File Templates:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {FILE_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className="p-1.5 rounded-lg border border-zinc-200 hover:border-blue-300 bg-zinc-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer flex flex-col"
                >
                  <div className="flex items-center gap-1">
                    <FileCodeIcon className="w-3 h-3 text-blue-600" />
                    <span className="font-mono font-bold text-[11px] text-zinc-800">
                      {sug.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 truncate mt-0.5">
                    {sug.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* File Name Input */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              File Name (e.g. <code>pins.h</code>, <code>config.h</code>, <code>logic.cpp</code>) *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. pins.h"
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Quick Extension Badges */}
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <span className="font-medium">Quick Extensions:</span>
            {['.h', '.cpp', '.ino', '.hpp', '.json'].map((ext) => (
              <button
                key={ext}
                type="button"
                onClick={() => {
                  const base = fileName.includes('.') ? fileName.split('.')[0] : fileName;
                  setFileName(`${base || 'custom'}${ext}`);
                  setError(null);
                }}
                className="px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded font-mono text-zinc-600 transition-colors cursor-pointer"
              >
                {ext}
              </button>
            ))}
          </div>

          {/* Auto-Save to Case Note */}
          <div className="p-2 bg-blue-50/70 border border-blue-200/80 rounded-lg text-[10.5px] text-blue-800 flex items-start gap-1.5">
            <span className="text-blue-600 font-bold">ℹ️</span>
            <span>
              File baru akan muncul sebagai <strong>Draft</strong> dan otomatis masuk secara permanen ke Case aktif saat Anda menekan <strong>Simpan ke Case</strong>.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <FilePlusIcon className="w-3.5 h-3.5" />
              <span>Create File</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
