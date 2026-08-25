import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBar } from '@/components/layout/StatusBar';
import { ArchitectureState } from '@/types';

const mockEmptyArch: ArchitectureState = {
  inputs: [null, null, null],
  boards: [null, null, null],
  outputs: [null, null, null],
  inputConditioners: [null, null, null],
  outputConditioners: [null, null, null],
};

describe('StatusBar Component', () => {
  it('should render default status message and hide slot counters & quick links in default educator mode', () => {
    render(<StatusBar architecture={mockEmptyArch} />);

    expect(screen.getByText('Status: Ready')).toBeInTheDocument();
    expect(screen.queryByText(/IN:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/BOARD:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/OUT:/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Documentation')).not.toBeInTheDocument();
    expect(screen.queryByText('Shortcuts')).not.toBeInTheDocument();
    expect(screen.queryByText('Support')).not.toBeInTheDocument();
  });

  it('should render IN, BOARD, and OUT slot counters and quick links in developer mode', () => {
    render(<StatusBar architecture={mockEmptyArch} mode="developer" />);

    expect(screen.getByText(/IN:/i)).toBeInTheDocument();
    expect(screen.getByText(/BOARD:/i)).toBeInTheDocument();
    expect(screen.getByText(/OUT:/i)).toBeInTheDocument();
    expect(screen.getAllByText('0/3')).toHaveLength(3);
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('should render both Educator Mode and Developer Mode buttons', () => {
    render(<StatusBar architecture={mockEmptyArch} />);

    expect(screen.getByRole('button', { name: /Educator Mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Developer Mode/i })).toBeInTheDocument();
  });

  it('should switch mode when buttons are clicked in uncontrolled mode', () => {
    render(<StatusBar architecture={mockEmptyArch} />);

    const educatorBtn = screen.getByRole('button', { name: /Educator Mode/i });
    const developerBtn = screen.getByRole('button', { name: /Developer Mode/i });

    // Initial default is educator
    expect(educatorBtn).toHaveAttribute('aria-pressed', 'true');
    expect(developerBtn).toHaveAttribute('aria-pressed', 'false');

    // Click Developer Mode
    fireEvent.click(developerBtn);
    expect(developerBtn).toHaveAttribute('aria-pressed', 'true');
    expect(educatorBtn).toHaveAttribute('aria-pressed', 'false');

    // Click Educator Mode
    fireEvent.click(educatorBtn);
    expect(educatorBtn).toHaveAttribute('aria-pressed', 'true');
    expect(developerBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('should notify onModeChange callback when mode button is clicked', () => {
    const handleModeChange = vi.fn();
    render(
      <StatusBar
        architecture={mockEmptyArch}
        mode="educator"
        onModeChange={handleModeChange}
      />
    );

    const developerBtn = screen.getByRole('button', { name: /Developer Mode/i });
    fireEvent.click(developerBtn);

    expect(handleModeChange).toHaveBeenCalledWith('developer');
  });

  it('should reflect controlled mode prop', () => {
    const { rerender } = render(
      <StatusBar
        architecture={mockEmptyArch}
        mode="educator"
      />
    );

    expect(screen.getByRole('button', { name: /Educator Mode/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Developer Mode/i })).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <StatusBar
        architecture={mockEmptyArch}
        mode="developer"
      />
    );

    expect(screen.getByRole('button', { name: /Developer Mode/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Educator Mode/i })).toHaveAttribute('aria-pressed', 'false');
  });
});
