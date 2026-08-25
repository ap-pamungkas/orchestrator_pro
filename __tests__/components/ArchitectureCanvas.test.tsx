import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArchitectureCanvas } from '@/components/architecture/ArchitectureCanvas';
import { ArchitectureState, KitComponent } from '@/types';

const mockButton: KitComponent = {
  id: 'tactile-button',
  name: 'Tactile Button',
  category: 'input',
  type: 'Digital Input',
  description: 'Momentary push button',
  image: '/components/tactile_button.png',
  defaultGpio: '18',
};

const mockEsp32: KitComponent = {
  id: 'esp32',
  name: 'ESP32 NodeMCU',
  category: 'board',
  type: 'Microcontroller',
  description: 'Dual-core MCU with Wi-Fi & Bluetooth',
  image: '/components/esp32.png',
};

const mockLed: KitComponent = {
  id: 'led',
  name: 'Standard LED',
  category: 'output',
  type: 'Digital Output',
  description: '5mm indicator LED',
  image: '/components/led.png',
  defaultGpio: '2',
};

describe('ArchitectureCanvas Wiring Tool', () => {
  it('should not render any wires by default when architecture.wires is empty', () => {
    const emptyArch: ArchitectureState = {
      inputs: [mockButton, null, null],
      boards: [null, mockEsp32, null],
      outputs: [mockLed, null, null],
      wires: [],
    };

    const { container } = render(
      <ArchitectureCanvas
        architecture={emptyArch}
        selectedComponent={null}
        draggedCategory={null}
        errorMessage={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={vi.fn()}
        onInvalidDropAttempt={vi.fn()}
        onDismissError={vi.fn()}
      />
    );

    // No glowing or active cables in SVG when wires is empty
    expect(container.querySelectorAll('.cable-flow-active-blue').length).toBe(0);
    expect(container.querySelectorAll('.cable-flow-active-emerald').length).toBe(0);
  });

  it('should render active cables when valid wires exist between slots', () => {
    const connectedArch: ArchitectureState = {
      inputs: [mockButton, null, null],
      boards: [null, mockEsp32, null],
      outputs: [mockLed, null, null],
      wires: [
        {
          id: 'wire-in0-b1',
          fromCategory: 'input',
          fromSlot: 0,
          toCategory: 'board',
          toSlot: 1,
        },
        {
          id: 'wire-b1-out0',
          fromCategory: 'board',
          fromSlot: 1,
          toCategory: 'output',
          toSlot: 0,
        },
      ],
    };

    const { container } = render(
      <ArchitectureCanvas
        architecture={connectedArch}
        selectedComponent={null}
        draggedCategory={null}
        errorMessage={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={vi.fn()}
        onInvalidDropAttempt={vi.fn()}
        onDismissError={vi.fn()}
      />
    );

    // Upper bridge has active blue cable
    expect(container.querySelectorAll('.cable-flow-active-blue').length).toBe(1);
    // Lower bridge has active emerald cable
    expect(container.querySelectorAll('.cable-flow-active-emerald').length).toBe(1);

    // All wire SVG overlay paths must have fill="none" to avoid black fill artifact on curved lines
    const wirePaths = container.querySelectorAll('svg.pointer-events-none path');
    expect(wirePaths.length).toBeGreaterThan(0);
    wirePaths.forEach((path) => {
      expect(path.getAttribute('fill')).toBe('none');
    });
  });

  it('should trigger onConnectWire when dragging wire from Input to Board', () => {
    const handleConnectWire = vi.fn();
    const handleInvalidDrop = vi.fn();

    const emptyArch: ArchitectureState = {
      inputs: [mockButton, null, null],
      boards: [null, mockEsp32, null],
      outputs: [mockLed, null, null],
      wires: [],
    };

    render(
      <ArchitectureCanvas
        architecture={emptyArch}
        selectedComponent={null}
        draggedCategory={null}
        errorMessage={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={vi.fn()}
        onConnectWire={handleConnectWire}
        onInvalidDropAttempt={handleInvalidDrop}
        onDismissError={vi.fn()}
      />
    );

    // Drag from Input Slot 1 bottom port
    const inputPorts = screen.getAllByTitle('Tarik garis (Drag to connect) ke Device / Board');
    fireEvent.mouseDown(inputPorts[0]);

    // Drop on Board Slot 2 top port
    const boardPorts = screen.getAllByTitle(/Input Port \(Drop wire to connect\)/);
    fireEvent.mouseUp(boardPorts[1]);

    expect(handleConnectWire).toHaveBeenCalledWith('input', 0, 'board', 1);
    expect(handleInvalidDrop).not.toHaveBeenCalled();
  });

  it('should reject direct wire connection from Input to Output', () => {
    const handleConnectWire = vi.fn();
    const handleInvalidDrop = vi.fn();

    const emptyArch: ArchitectureState = {
      inputs: [mockButton, null, null],
      boards: [null, mockEsp32, null],
      outputs: [mockLed, null, null],
      wires: [],
    };

    render(
      <ArchitectureCanvas
        architecture={emptyArch}
        selectedComponent={null}
        draggedCategory={null}
        errorMessage={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={vi.fn()}
        onConnectWire={handleConnectWire}
        onInvalidDropAttempt={handleInvalidDrop}
        onDismissError={vi.fn()}
      />
    );

    // Drag from Input Slot 1 bottom port
    const inputPorts = screen.getAllByTitle('Tarik garis (Drag to connect) ke Device / Board');
    fireEvent.mouseDown(inputPorts[0]);

    // Drop directly onto Output Slot 1 top port (which has index 3 in all input ports)
    const allInputPorts = screen.getAllByTitle(/Input Port \(Drop wire to connect\)/);
    // Board slots are 0, 1, 2. Output slots are 3, 4, 5.
    fireEvent.mouseUp(allInputPorts[3]);

    expect(handleConnectWire).not.toHaveBeenCalled();
    expect(handleInvalidDrop).toHaveBeenCalledWith(
      expect.stringContaining('Jalur Input harus terhubung ke Device/Board')
    );
  });

  it('should trigger onDisconnectWire when disconnect button on wire is clicked', () => {
    const handleDisconnectWire = vi.fn();

    const connectedArch: ArchitectureState = {
      inputs: [mockButton, null, null],
      boards: [null, mockEsp32, null],
      outputs: [null, null, null],
      wires: [
        {
          id: 'wire-test-123',
          fromCategory: 'input',
          fromSlot: 0,
          toCategory: 'board',
          toSlot: 1,
        },
      ],
    };

    render(
      <ArchitectureCanvas
        architecture={connectedArch}
        selectedComponent={null}
        draggedCategory={null}
        errorMessage={null}
        onDropComponent={vi.fn()}
        onSelectComponent={vi.fn()}
        onRemoveComponent={vi.fn()}
        onDropConditioner={vi.fn()}
        onRemoveConditioner={vi.fn()}
        onDisconnectWire={handleDisconnectWire}
        onInvalidDropAttempt={vi.fn()}
        onDismissError={vi.fn()}
      />
    );

    const disconnectBtn = screen.getByTitle('Disconnect wire');
    fireEvent.click(disconnectBtn);
    expect(handleDisconnectWire).toHaveBeenCalledWith('wire-test-123');
  });
});
