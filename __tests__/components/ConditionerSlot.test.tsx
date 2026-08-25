import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConditionerSlot } from '@/components/architecture/ConditionerSlot';
import { KitComponent } from '@/types';

const mockResistor: KitComponent = {
  id: 'pullup-resistor',
  name: 'Pull-up Resistor',
  category: 'conditioner',
  type: 'Signal Conditioning',
  description: '10k Pull-up Resistor module',
  image: '/components/tactile_button.png',
};

describe('ConditionerSlot Component', () => {
  it('should render empty conditioner slot', () => {
    render(
      <ConditionerSlot
        busType="input"
        slotIndex={0}
        component={null}
        isRequired={false}
        draggedCategory={null}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={vi.fn()}
        onInvalidDropAttempt={vi.fn()}
      />
    );

    expect(screen.getByTitle(/Add-on \/ Conditioner Slot/)).toBeInTheDocument();
  });

  it('should show requirement alert when isRequired is true', () => {
    render(
      <ConditionerSlot
        busType="input"
        slotIndex={0}
        component={null}
        isRequired={true}
        requiredName="Pull-up Resistor"
        draggedCategory={null}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={vi.fn()}
        onInvalidDropAttempt={vi.fn()}
      />
    );

    expect(screen.getByTitle(/REQUIRED: Pull-up Resistor/)).toBeInTheDocument();
    expect(screen.getByText(/Pull-up Resistor Required/)).toBeInTheDocument();
  });

  it('should render component info when occupied', () => {
    render(
      <ConditionerSlot
        busType="input"
        slotIndex={0}
        component={mockResistor}
        isRequired={false}
        draggedCategory={null}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={vi.fn()}
        onInvalidDropAttempt={vi.fn()}
      />
    );

    expect(screen.getByTitle(/Pull-up Resistor/)).toBeInTheDocument();
  });

  it('should trigger onRemoveConditioner when remove button is clicked', () => {
    const handleRemove = vi.fn();
    render(
      <ConditionerSlot
        busType="input"
        slotIndex={0}
        component={mockResistor}
        isRequired={false}
        draggedCategory={null}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={handleRemove}
        onInvalidDropAttempt={vi.fn()}
      />
    );

    const removeBtn = screen.getByTitle('Remove add-on');
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith('input', 0);
  });

  it('should render seamless direct bypass when Direct component is attached', () => {
    const handleRemove = vi.fn();
    const directComp: KitComponent = {
      id: 'direct',
      name: 'Direct',
      category: 'conditioner',
      type: 'Direct Bypass',
    };

    render(
      <ConditionerSlot
        busType="output"
        slotIndex={1}
        component={directComp}
        isRequired={false}
        draggedCategory={null}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={handleRemove}
        onInvalidDropAttempt={vi.fn()}
      />
    );

    const removeDirectBtn = screen.getByTitle('Remove direct bypass');
    expect(removeDirectBtn).toBeInTheDocument();
    fireEvent.click(removeDirectBtn);
    expect(handleRemove).toHaveBeenCalledWith('output', 1);
  });
});
