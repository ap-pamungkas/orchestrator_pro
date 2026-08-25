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

  it('should render code editor and Case Explorer when architecture is complete in developer mode', () => {
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
        mode="developer"
      />
    );

    expect(screen.getByText('Code Editor')).toBeInTheDocument();
    expect(screen.getByText(/CASE EXPLORER/)).toBeInTheDocument();
    expect(screen.getAllByText('sketch.ino').length).toBeGreaterThan(0);
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

  it('should trigger onUpdateCase when Simpan button is clicked in developer mode', () => {
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
        mode="developer"
      />
    );

    const saveBtn = screen.getByText('Simpan');
    fireEvent.click(saveBtn);
    expect(handleUpdate).toHaveBeenCalled();
  });

  it('should keep variations list visible in educator mode while hiding create/save/reset/copy/download/tabs controls', () => {
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
        onToggleExpand={vi.fn()}
        mode="educator"
      />
    );

    expect(screen.getByText('Code Editor')).toBeInTheDocument();
    // Variation list is present
    expect(screen.getByText(/CASE EXPLORER/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Button → LED ON/i).length).toBeGreaterThan(0);

    // Tools and actions are hidden
    expect(screen.queryByText(/Tactile Button ➔ ESP32 ➔ Red LED/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Collapse Explorer|Expand Project Explorer/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Expand Code Editor to full canvas|Restore card size/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Simpan')).not.toBeInTheDocument();
    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Add new file to current case folder/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tersimpan di Case/i)).not.toBeInTheDocument();
    expect(screen.queryByText('+ Case')).not.toBeInTheDocument();
  });

  it('should allow inline file creation directly in the Case Explorer tree in educator and developer mode', () => {
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
        mode="educator"
      />
    );

    // Find the '+' button at the bottom of the case folder
    const addFileBtn = screen.getByTitle(`Add new file inside "${CODE_VARIATIONS[0].title}"`);
    expect(addFileBtn).toBeInTheDocument();
    expect(addFileBtn.textContent).toBe('+');

    // Click '+' to open inline input
    fireEvent.click(addFileBtn);

    const input = screen.getByPlaceholderText('sketch.ino / helper.h');
    expect(input).toBeInTheDocument();

    // Type new file name without extension and press Enter
    fireEvent.change(input, { target: { value: 'functions' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Verify onUpdateCase was called with the new file defaulting to .ino
    expect(handleUpdate).toHaveBeenCalled();
    const updatedVariation = handleUpdate.mock.calls[0][0];
    expect(updatedVariation.files.some((f: { name: string }) => f.name === 'functions.ino')).toBe(true);
  });

  it('should allow inline file renaming via rename button and double click without any modal popup', () => {
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
        mode="developer"
      />
    );

    // Find the Rename button on the tab (or explorer)
    const renameButtons = screen.getAllByTitle('Rename sketch.ino');
    expect(renameButtons.length).toBeGreaterThan(0);

    // Click rename button to trigger inline renaming
    fireEvent.click(renameButtons[0]);

    // An input should appear in place of the text label
    const inputs = screen.getAllByDisplayValue('sketch.ino');
    expect(inputs.length).toBeGreaterThan(0);

    // Change input and press Enter
    fireEvent.change(inputs[0], { target: { value: 'app.ino' } });
    fireEvent.keyDown(inputs[0], { key: 'Enter', code: 'Enter' });

    // Verify onUpdateCase was called with the renamed file
    expect(handleUpdate).toHaveBeenCalled();
    const updatedVariation = handleUpdate.mock.calls[0][0];
    expect(updatedVariation.files.some((f: { name: string }) => f.name === 'app.ino')).toBe(true);
  });

  it('should toggle Case Explorer open/closed and switch button between Perluas and Perkecil in educator and developer mode', () => {
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
        mode="educator"
      />
    );

    // Initial state: explorer is open, button has title "Perluas Editor"
    const toggleBtn = screen.getByTitle('Perluas Editor');
    expect(toggleBtn).toBeInTheDocument();

    // Verify Copy button is present to the left of expand
    const copyBtn = screen.getByTitle('Copy Code');
    expect(copyBtn).toBeInTheDocument();

    // Click copy button
    fireEvent.click(copyBtn);
    expect(screen.getByTitle('Copied')).toBeInTheDocument();

    // Click to expand editor (hide case explorer)
    fireEvent.click(toggleBtn);

    // Button should now show title "Perkecil Editor"
    const restoreBtn = screen.getByTitle('Perkecil Editor');
    expect(restoreBtn).toBeInTheDocument();

    // Click again to reopen explorer
    fireEvent.click(restoreBtn);

    // Button reverts to "Perluas Editor"
    expect(screen.getByTitle('Perluas Editor')).toBeInTheDocument();
  });
});





