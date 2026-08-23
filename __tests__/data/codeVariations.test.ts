import { describe, it, expect } from 'vitest';
import { CODE_VARIATIONS } from '@/data/codeVariations';

describe('CODE_VARIATIONS Dataset', () => {
  it('should contain default code variations', () => {
    expect(CODE_VARIATIONS.length).toBeGreaterThan(0);
  });

  it('should have unique variation IDs', () => {
    const ids = CODE_VARIATIONS.map((v) => v.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have non-empty C++ sourceCode for all variations', () => {
    CODE_VARIATIONS.forEach((v) => {
      expect(v.sourceCode).toBeDefined();
      expect(v.sourceCode.trim().length).toBeGreaterThan(0);
      expect(v.sourceCode).toContain('setup');
      expect(v.sourceCode).toContain('loop');
    });
  });

  it('should have valid difficulty ratings', () => {
    const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
    CODE_VARIATIONS.forEach((v) => {
      expect(validDifficulties).toContain(v.difficulty);
    });
  });

  it('should include symbol explanations', () => {
    CODE_VARIATIONS.forEach((v) => {
      expect(Array.isArray(v.codeExplanation)).toBe(true);
      expect(v.codeExplanation.length).toBeGreaterThan(0);
      v.codeExplanation.forEach((expl) => {
        expect(expl.symbol).toBeDefined();
        expect(expl.description).toBeDefined();
      });
    });
  });
});
