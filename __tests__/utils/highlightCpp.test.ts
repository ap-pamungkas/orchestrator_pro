import { describe, it, expect } from 'vitest';
import { highlightCppCode } from '@/components/code-variations/highlightCpp';

describe('highlightCppCode Syntax Highlighter', () => {
  it('should return empty string for blank input', () => {
    expect(highlightCppCode('')).toBe('');
  });

  it('should highlight C++ keywords with keyword styling', () => {
    const code = 'void setup() { int pin = 18; }';
    const highlighted = highlightCppCode(code);
    expect(highlighted).toContain('#c678dd'); // Purple keyword color
    expect(highlighted).toContain('void');
    expect(highlighted).toContain('int');
  });

  it('should highlight comments with italic styling', () => {
    const code = '// This is a comment\nint x = 1;';
    const highlighted = highlightCppCode(code);
    expect(highlighted).toContain('#7f848e'); // Gray comment color
    expect(highlighted).toContain('font-style: italic');
  });

  it('should highlight string literals with green styling', () => {
    const code = 'Serial.println("Hello ESP32");';
    const highlighted = highlightCppCode(code);
    expect(highlighted).toContain('#98c379'); // Green string color
    expect(highlighted).toContain('"Hello ESP32"');
  });

  it('should escape HTML characters safely', () => {
    const code = '#include <Arduino.h>';
    const highlighted = highlightCppCode(code);
    expect(highlighted).toContain('&lt;Arduino.h&gt;');
  });
});
