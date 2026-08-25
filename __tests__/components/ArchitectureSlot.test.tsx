import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchitectureSlot } from '@/components/architecture/ArchitectureSlot';
import { KitComponent } from '@/types';

const mockButton: KitComponent = {
  id: 'tactile-button',
  name: 'Tactile Button',
  category: 'input',
  type: 'Digital Input',
  description: 'Momentary push button',
  image: '/components/tactile_button.png',
  defaultGpio: '18',
};

describe('ArchitectureSlot Component', () => {
  it('should render empty slot placeholder when no component is placed', () => {
    render(
      <ArchitectureSlot
        category="input"
        slotIndex={0}
        component={null}
        selectedComponent={null}
        draggedCategory={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
      />
    );

    expect(screen.getByText('Slot 1')).toBeInTheDocument();
  });

  it('should render component name and GPIO badge when occupied', () => {
    render(
      <ArchitectureSlot
        category="input"
        slotIndex={0}
        component={mockButton}
        selectedComponent={null}
        draggedCategory={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
      />
    );

    expect(screen.getByText('Tactile Button')).toBeInTheDocument();
    expect(screen.getByText('GP18')).toBeInTheDocument();
  });

  it('should trigger onSelectComponent when occupied slot is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <ArchitectureSlot
        category="input"
        slotIndex={0}
        component={mockButton}
        selectedComponent={null}
        draggedCategory={null}
        onDropComponent={vi.fn()}
        onSelectComponent={handleSelect}
        onRemoveComponent={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Tactile Button'));
    expect(handleSelect).toHaveBeenCalledWith(mockButton);
  });

  it('should trigger onRemoveComponent when trash button is clicked', () => {
    const handleRemove = vi.fn();
    render(
      <ArchitectureSlot
        category="input"
        slotIndex={0}
        component={mockButton}
        selectedComponent={null}
        draggedCategory={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={handleRemove}
      />
    );

    const removeBtn = screen.getByTitle('Remove component');
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith('input', 0);
  });

  it('should trigger onStartWire when bottom port is clicked', () => {
    const handleStartWire = vi.fn();
    render(
      <ArchitectureSlot
        category="input"
        slotIndex={0}
        component={mockButton}
        selectedComponent={null}
        draggedCategory={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
        onStartWire={handleStartWire}
      />
    );

    const port = screen.getByTitle('Tarik garis (Drag to connect) ke Device / Board');
    fireEvent.mouseDown(port);
    expect(handleStartWire).toHaveBeenCalledWith('input', 0, expect.any(Object));
  });

  it('should trigger onCompleteWire when top port is dropped onto', () => {
    const handleCompleteWire = vi.fn();
    render(
      <ArchitectureSlot
        category="board"
        slotIndex={1}
        component={null}
        selectedComponent={null}
        draggedCategory={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
        onCompleteWire={handleCompleteWire}
      />
    );

    const topPort = screen.getByTitle('Input Port (Drop wire to connect)');
    fireEvent.mouseUp(topPort);
    expect(handleCompleteWire).toHaveBeenCalledWith('board', 1);
  });
});
