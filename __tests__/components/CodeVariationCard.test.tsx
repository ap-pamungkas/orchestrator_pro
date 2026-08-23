import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeVariationCard } from '@/components/code-variations/CodeVariationCard';
import { ArchitectureState, KitComponent } from '@/types';
import { CODE_VARIATIONS } from '@/data/codeVariations';

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
  description: 'Dual-core MCU',
  image: '/components/esp32.png',
};

const mockLed: KitComponent = {
  id: 'led',
  name: 'Red LED',
  category: 'output',
  type: 'Digital Output',
  description: '5mm LED',
  image: '/components/led.png',
  defaultGpio: '2',
};

const incompleteArchitecture: ArchitectureState = {
  inputs: [mockButton, null, null],
  boards: [null, null, null],
  outputs: [null, null, null],
  inputConditioners: [null, null, null],
  outputConditioners: [null, null, null],
};

const completeArchitecture: ArchitectureState = {
  inputs: [mockButton, null, null],
  boards: [null, mockEsp32, null],
  outputs: [mockLed, null, null],
  inputConditioners: [null, null, null],
  outputConditioners: [null, null, null],
};

describe('CodeVariationCard Component', () => {
  it('should display incomplete notice when pipeline is missing board or output', () => {
    render(
      <CodeVariationCard
        architecture={incompleteArchitecture}
        selectedComponent={null}
        selectedVariation={null}
        allVariations={CODE_VARIATIONS}
        onSelectVariation={vi.fn()}
        onAddCustomCase={vi.fn()}
        onUpdateCase={vi.fn()}
        onDeleteCustomCase={vi.fn()}
      />
    );

    expect(screen.getByText('Architecture Pipeline Incomplete')).toBeInTheDocument();
  });

  it('should render code editor and Case Explorer when architecture is complete', () => {
    render(
      <CodeVariationCard
        architecture={completeArchitecture}
        selectedComponent={mockButton}
        selectedVariation={CODE_VARIATIONS[0]}
        allVariations={CODE_VARIATIONS}
        onSelectVariation={vi.fn()}
        onAddCustomCase={vi.fn()}
        onUpdateCase={vi.fn()}
        onDeleteCustomCase={vi.fn()}
      />
    );

    expect(screen.getByText('Code Editor')).toBeInTheDocument();
    expect(screen.getByText(/CASE EXPLORER/)).toBeInTheDocument();
    expect(screen.getAllByText('main.cpp').length).toBeGreaterThan(0);
  });

  it('should show empty state when input sensor has no cases in the pipeline', () => {
    const dhtArchitecture: ArchitectureState = {
      inputs: [{ ...mockButton, id: 'dht22', name: 'DHT22 Sensor' }, null, null],
      boards: [null, mockEsp32, null],
      outputs: [mockLed, null, null],
      inputConditioners: [null, null, null],
      outputConditioners: [null, null, null],
    };

    render(
      <CodeVariationCard
        architecture={dhtArchitecture}
        selectedComponent={null}
        selectedVariation={null}
        allVariations={CODE_VARIATIONS}
        onSelectVariation={vi.fn()}
        onAddCustomCase={vi.fn()}
        onUpdateCase={vi.fn()}
        onDeleteCustomCase={vi.fn()}
      />
    );

    expect(screen.getByText(/Belum Ada Case Kode untuk DHT22 Sensor/)).toBeInTheDocument();
  });

  it('should trigger onUpdateCase when Simpan button is clicked', () => {
    const handleUpdate = vi.fn();
    render(
      <CodeVariationCard
        architecture={completeArchitecture}
        selectedComponent={mockButton}
        selectedVariation={CODE_VARIATIONS[0]}
        allVariations={CODE_VARIATIONS}
        onSelectVariation={vi.fn()}
        onAddCustomCase={vi.fn()}
        onUpdateCase={handleUpdate}
        onDeleteCustomCase={vi.fn()}
      />
    );

    const saveBtn = screen.getByText('Simpan');
    fireEvent.click(saveBtn);
    expect(handleUpdate).toHaveBeenCalled();
  });
});
