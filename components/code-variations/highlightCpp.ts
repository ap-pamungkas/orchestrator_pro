/**
 * High-performance, zero-dependency C++ & Arduino syntax highlighter for Web IDE
 */

export function highlightCppCode(rawCode: string): string {
  if (!rawCode) return '';

  // 1. Process line-by-line or with regex tokenization
  const lines = rawCode.split('\n');

  const highlightedLines = lines.map((line) => {
    // Empty line
    if (!line) return '';

    // Full line comment
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return `<span style="color: #7f848e; font-style: italic;">${escapeHtml(line)}</span>`;
    }

    // Preprocessor directive (#include, #define)
    if (trimmed.startsWith('#')) {
      return `<span style="color: #e06c75; font-weight: 600;">${escapeHtml(line)}</span>`;
    }

    let result = '';
    let i = 0;
    const len = line.length;

    while (i < len) {
      // Check for inline comment //
      if (line[i] === '/' && line[i + 1] === '/') {
        const comment = line.slice(i);
        result += `<span style="color: #7f848e; font-style: italic;">${escapeHtml(comment)}</span>`;
        break;
      }

      // Check for string literals "..."
      if (line[i] === '"') {
        let str = '"';
        i++;
        while (i < len && line[i] !== '"') {
          if (line[i] === '\\' && i + 1 < len) {
            str += line[i] + line[i + 1];
            i += 2;
          } else {
            str += line[i];
            i++;
          }
        }
        if (i < len && line[i] === '"') {
          str += '"';
          i++;
        }
        result += `<span style="color: #98c379;">${escapeHtml(str)}</span>`;
        continue;
      }

      // Check for single char literal '.'
      if (line[i] === "'") {
        let ch = "'";
        i++;
        while (i < len && line[i] !== "'") {
          ch += line[i];
          i++;
        }
        if (i < len && line[i] === "'") {
          ch += "'";
          i++;
        }
        result += `<span style="color: #98c379;">${escapeHtml(ch)}</span>`;
        continue;
      }

      // Check for numbers (decimal, hex)
      if (/\d/.test(line[i]) && (i === 0 || /[^a-zA-Z0-9_]/.test(line[i - 1]))) {
        let num = '';
        while (i < len && /[0-9xXa-fA-F.]/.test(line[i])) {
          num += line[i];
          i++;
        }
        result += `<span style="color: #d19a66; font-weight: 500;">${escapeHtml(num)}</span>`;
        continue;
      }

      // Check for words / identifiers
      if (/[a-zA-Z_]/.test(line[i])) {
        let word = '';
        while (i < len && /[a-zA-Z0-9_]/.test(line[i])) {
          word += line[i];
          i++;
        }

        // Keywords / Types (Purple / Magenta)
        if (CPP_KEYWORDS.has(word)) {
          result += `<span style="color: #c678dd; font-weight: 600;">${escapeHtml(word)}</span>`;
        }
        // Arduino Hardware Constants (Amber / Gold)
        else if (ARDUINO_CONSTANTS.has(word)) {
          result += `<span style="color: #e5c07b; font-weight: 600;">${escapeHtml(word)}</span>`;
        }
        // Functions / APIs (Cyan / Sky Blue)
        else if (ARDUINO_FUNCTIONS.has(word) || (i < len && line[i] === '(')) {
          result += `<span style="color: #61afef; font-weight: 500;">${escapeHtml(word)}</span>`;
        }
        // Standard identifiers / variables
        else {
          result += `<span style="color: #abb2bf;">${escapeHtml(word)}</span>`;
        }
        continue;
      }

      // Operators and Punctuation (Teal / Blue-gray)
      if (/[=+\-*/%&|^!<>?:;.,(){}[\]]/.test(line[i])) {
        const char = line[i];
        if (/[=+\-*/%&|^!<>?]/.test(char)) {
          result += `<span style="color: #56b6c2;">${escapeHtml(char)}</span>`;
        } else {
          result += `<span style="color: #abb2bf;">${escapeHtml(char)}</span>`;
        }
        i++;
        continue;
      }

      // Whitespace and other characters
      result += escapeHtml(line[i]);
      i++;
    }

    return result;
  });

  return highlightedLines.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const CPP_KEYWORDS = new Set([
  'void', 'int', 'const', 'bool', 'unsigned', 'long', 'float', 'double', 'char',
  'if', 'else', 'while', 'for', 'do', 'switch', 'case', 'break', 'default',
  'return', 'true', 'false', 'NULL', 'nullptr', 'class', 'struct', 'public',
  'private', 'protected', 'virtual', 'static', 'inline', 'typedef', 'volatile'
]);

const ARDUINO_CONSTANTS = new Set([
  'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'INPUT_PULLDOWN',
  'LED_BUILTIN', 'CHANGE', 'FALLING', 'RISING', 'MSBFIRST', 'LSBFIRST',
  'BUTTON', 'BUTTON_PIN', 'BUTTON_1', 'BUTTON_2',
  'LED', 'LED_PIN', 'LED_1', 'LED_2', 'BUZZER_PIN', 'POT_PIN'
]);

const ARDUINO_FUNCTIONS = new Set([
  'setup', 'loop', 'pinMode', 'digitalRead', 'digitalWrite', 'analogRead', 'analogWrite',
  'Serial', 'begin', 'print', 'println', 'write', 'available', 'read',
  'delay', 'delayMicroseconds', 'millis', 'micros',
  'ledcAttach', 'ledcWrite', 'ledcSetup', 'ledcAttachPin',
  'attachInterrupt', 'detachInterrupt', 'digitalPinToInterrupt',
  'map', 'constrain', 'min', 'max', 'abs'
]);
