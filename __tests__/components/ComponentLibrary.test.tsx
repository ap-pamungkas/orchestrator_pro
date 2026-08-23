import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentLibrary } from '@/components/component-library/ComponentLibrary';
import { KIT_COMPONENTS } from '@/data/components';

describe('ComponentLibrary Component', () => {
  it('should render all 4 category headers (INPUT, Device, OUTPUT, Conditioner)', () => {
    render(
      <ComponentLibrary
        components={KIT_COMPONENTS}
        onAddComponent={vi.fn()}
        onDeleteComponent={vi.fn()}
        onDragStartComponent={vi.fn()}
        onDragEndComponent={vi.fn()}
      />
    );

    expect(screen.getByText('INPUT')).toBeInTheDocument();
    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('OUTPUT')).toBeInTheDocument();
    expect(screen.getByText('Conditioner')).toBeInTheDocument();
  });

  it('should display the total component count badge', () => {
    render(
      <ComponentLibrary
        components={KIT_COMPONENTS}
        onAddComponent={vi.fn()}
        onDeleteComponent={vi.fn()}
        onDragStartComponent={vi.fn()}
        onDragEndComponent={vi.fn()}
      />
    );

    expect(screen.getByText(KIT_COMPONENTS.length.toString())).toBeInTheDocument();
  });

  it('should toggle accordion when category header is clicked', () => {
    render(
      <ComponentLibrary
        components={KIT_COMPONENTS}
        onAddComponent={vi.fn()}
        onDeleteComponent={vi.fn()}
        onDragStartComponent={vi.fn()}
        onDragEndComponent={vi.fn()}
      />
    );

    // Initial state: components are visible
    expect(screen.getByText('Tactile Button')).toBeInTheDocument();

    // Click INPUT category header to collapse
    fireEvent.click(screen.getByText('INPUT'));
    expect(screen.queryByText('Tactile Button')).not.toBeInTheDocument();

    // Click again to expand
    fireEvent.click(screen.getByText('INPUT'));
    expect(screen.getByText('Tactile Button')).toBeInTheDocument();
  });

  it('should open Add Component modal when "+ Create Custom Component" is clicked', () => {
    render(
      <ComponentLibrary
        components={KIT_COMPONENTS}
        onAddComponent={vi.fn()}
        onDeleteComponent={vi.fn()}
        onDragStartComponent={vi.fn()}
        onDragEndComponent={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('+ Create Custom Component'));
    expect(screen.getByText('Add New Kit Component')).toBeInTheDocument();
  });
});
