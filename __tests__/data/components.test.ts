import { describe, it, expect } from 'vitest';
import { KIT_COMPONENTS } from '@/data/components';
import { ComponentCategory } from '@/types';

describe('KIT_COMPONENTS Dataset', () => {
  it('should contain predefined components', () => {
    expect(KIT_COMPONENTS.length).toBeGreaterThan(0);
  });

  it('should have all valid component categories', () => {
    const validCategories: ComponentCategory[] = ['input', 'board', 'output', 'conditioner'];
    KIT_COMPONENTS.forEach((comp) => {
      expect(validCategories).toContain(comp.category);
    });
  });

  it('should have unique component IDs', () => {
    const ids = KIT_COMPONENTS.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should contain primary board MCU (esp32)', () => {
    const esp32 = KIT_COMPONENTS.find((c) => c.id === 'esp32');
    expect(esp32).toBeDefined();
    expect(esp32?.category).toBe('board');
  });

  it('should define required conditioner for components requiring conditioning', () => {
    const led = KIT_COMPONENTS.find((c) => c.id === 'led');
    expect(led).toBeDefined();
    expect(led?.requiredConditionerId).toBe('resistor-220');
  });

  it('should contain the Direct (Bypass) conditioner component', () => {
    const direct = KIT_COMPONENTS.find((c) => c.id === 'direct');
    expect(direct).toBeDefined();
    expect(direct?.category).toBe('conditioner');
    expect(direct?.name).toContain('Direct');
  });
});
