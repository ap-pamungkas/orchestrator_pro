'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { KitComponent, ComponentCategory, ArchitectureState, CodeVariation, AppMode, WireConnection } from '@/types';
import { KIT_COMPONENTS } from '@/data/components';
import { CODE_VARIATIONS } from '@/data/codeVariations';
import { Header } from '@/components/layout/Header';
import { StatusBar } from '@/components/layout/StatusBar';
import { ComponentLibrary } from '@/components/component-library/ComponentLibrary';
import { ArchitectureCanvas } from '@/components/architecture/ArchitectureCanvas';
import { CodeVariationCard } from '@/components/code-variations/CodeVariationCard';
import { CpuIcon, CodeIcon } from '@/components/icons/Icons';

const STORAGE_CUSTOM_COMPONENTS = 'orchestrator_custom_components_v1';
const STORAGE_ALL_VARIATIONS = 'orchestrator_variations_state_v2';

export default function Home() {
  // Components State (Built-in + User Added Custom Components)
  const [components, setComponents] = useState<KitComponent[]>(KIT_COMPONENTS);

  // Code Variations & Cases State (Built-in + User Added Cases + File modifications)
  const [variations, setVariations] = useState<CodeVariation[]>(CODE_VARIATIONS);

  // Main Architecture State (3 slots each + Conditioner Addon slots + Dynamic Wires)
  const [architecture, setArchitecture] = useState<ArchitectureState>({
    inputs: [null, null, null],
    boards: [null, null, null],
    outputs: [null, null, null],
    inputConditioners: [null, null, null],
    outputConditioners: [null, null, null],
    wires: [],
    conditioner: [null, null, null],
  });

  // Active Selection States
  const [selectedComponent, setSelectedComponent] = useState<KitComponent | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<CodeVariation | null>(null);

  // Active Drag State
  const [draggedCategory, setDraggedCategory] = useState<ComponentCategory | null>(null);

  // Expand / Focus Card State ('pipeline' | 'code' | null)
  const [expandedCard, setExpandedCard] = useState<'pipeline' | 'code' | null>(null);

  // Error & Status Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isErrorStatus, setIsErrorStatus] = useState<boolean>(false);

  // App Mode State ('education' | 'developer')
  const [mode, setMode] = useState<AppMode>('educator');

  // Load custom persisted data from localStorage on client mount
  useEffect(() => {
    try {
      const savedCustomComps = localStorage.getItem(STORAGE_CUSTOM_COMPONENTS);
      if (savedCustomComps) {
        const parsedCustomComps = JSON.parse(savedCustomComps) as KitComponent[];
        if (Array.isArray(parsedCustomComps) && parsedCustomComps.length > 0) {
          // Merge avoiding ID collisions
          setComponents(() => {
            const builtInIds = new Set(KIT_COMPONENTS.map((c) => c.id));
            const validCustom = parsedCustomComps.filter((c) => !builtInIds.has(c.id));
            return [...KIT_COMPONENTS, ...validCustom];
          });
        }
      }

      const savedAllCases = localStorage.getItem(STORAGE_ALL_VARIATIONS);
      if (savedAllCases) {
        const parsedCases = JSON.parse(savedAllCases) as CodeVariation[];
        if (Array.isArray(parsedCases) && parsedCases.length > 0) {
          setVariations(parsedCases);
        }
      }
    } catch (e) {
      console.warn('Failed to load custom data from localStorage', e);
    }
  }, []);

  // Handler: Add New Component to Library
  const handleAddComponent = useCallback((newComp: KitComponent) => {
    setComponents((prev) => {
      const updated = [...prev, newComp];
      try {
        const customOnly = updated.filter((c) => c.isCustom);
        localStorage.setItem(STORAGE_CUSTOM_COMPONENTS, JSON.stringify(customOnly));
      } catch (err) {
        console.warn('Failed to persist custom components', err);
      }
      return updated;
    });
    setStatusMessage(`Added "${newComp.name}" to ${newComp.category.toUpperCase()} Library`);
    setIsErrorStatus(false);
  }, []);

  // Handler: Delete Custom Component
  const handleDeleteComponent = useCallback((componentId: string) => {
    setComponents((prev) => {
      const updated = prev.filter((c) => c.id !== componentId);
      try {
        const customOnly = updated.filter((c) => c.isCustom);
        localStorage.setItem(STORAGE_CUSTOM_COMPONENTS, JSON.stringify(customOnly));
      } catch (err) {
        console.warn('Failed to persist custom components', err);
      }
      return updated;
    });

    // Remove from active architecture if present
    setArchitecture((prev) => {
      const cleanSlots = (slots: (KitComponent | null)[]) =>
        slots.map((c) => (c?.id === componentId ? null : c));

      return {
        inputs: cleanSlots(prev.inputs),
        boards: cleanSlots(prev.boards),
        outputs: cleanSlots(prev.outputs),
        inputConditioners: cleanSlots(prev.inputConditioners || []),
        outputConditioners: cleanSlots(prev.outputConditioners || []),
        wires: (prev.wires || []).filter((w) => w.conditioner?.id !== componentId),
      };
    });

    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
    setStatusMessage('Deleted custom component from library');
  }, [selectedComponent]);

  // Handler: Add Custom Code Case / Scenario
  const handleAddCustomCase = useCallback((newCase: CodeVariation) => {
    setVariations((prev) => {
      const updated = [newCase, ...prev];
      try {
        localStorage.setItem(STORAGE_ALL_VARIATIONS, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to persist variations', err);
      }
      return updated;
    });

    setSelectedVariation(newCase);
    setStatusMessage(`Created Custom Case: "${newCase.title}"`);
    setIsErrorStatus(false);
  }, []);

  // Handler: Update / Rename Code Case or Case Files
  const handleUpdateCase = useCallback((updatedCase: CodeVariation) => {
    setVariations((prev) => {
      const updated = prev.map((v) => (v.id === updatedCase.id ? updatedCase : v));
      try {
        localStorage.setItem(STORAGE_ALL_VARIATIONS, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to persist variations', err);
      }
      return updated;
    });

    setSelectedVariation((curr) => (curr?.id === updatedCase.id ? updatedCase : curr));
    setStatusMessage(`Updated Case: "${updatedCase.title}"`);
    setIsErrorStatus(false);
  }, []);

  // Handler: Delete Custom Code Case
  const handleDeleteCustomCase = useCallback((caseId: string) => {
    setVariations((prev) => {
      const updated = prev.filter((v) => v.id !== caseId);
      try {
        localStorage.setItem(STORAGE_ALL_VARIATIONS, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to persist variations', err);
      }
      return updated;
    });

    setSelectedVariation((curr) => (curr?.id === caseId ? CODE_VARIATIONS[0] : curr));
    setStatusMessage('Deleted custom code case');
  }, []);

  // Drag Handlers
  const handleDragStart = useCallback((component: KitComponent) => {
    setDraggedCategory(component.category);
    setStatusMessage(`Dragging ${component.name} (${component.category.toUpperCase()})`);
    setIsErrorStatus(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCategory(null);
  }, []);

  // Drop Handler with slot index & category validation
  const handleDropComponent = useCallback((category: ComponentCategory, slotIndex: number, component: KitComponent) => {
    // Category validation
    if (component.category !== category) {
      const errorText = `Cannot place ${component.name} (${component.category.toUpperCase()}) into ${category.toUpperCase()} slot.`;
      setErrorMessage(errorText);
      setStatusMessage(`Rejected: ${errorText}`);
      setIsErrorStatus(true);
      return;
    }

    // Update Architecture Slot array
    setArchitecture((prev) => {
      const key = category === 'input' ? 'inputs' : category === 'board' ? 'boards' : 'outputs';
      const updatedSlots = [...prev[key]];
      updatedSlots[slotIndex] = component;
      return {
        ...prev,
        [key]: updatedSlots,
      };
    });

    // Visually focus placed component
    setSelectedComponent(component);

    // If no variation is selected yet, default to first matching variation
    if (!selectedVariation) {
      const defaultVar =
        variations.find((v) => v.componentId === component.id) ||
        variations.find((v) => v.componentId === 'tactile-button') ||
        variations[0];
      setSelectedVariation(defaultVar);
    }

    setDraggedCategory(null);
    setErrorMessage(null);
    setStatusMessage(`Placed ${component.name} in ${category.toUpperCase()} Slot ${slotIndex + 1}`);
    setIsErrorStatus(false);
  }, [selectedVariation, variations]);

  // Drop Conditioner Addon Handler
  const handleDropConditioner = useCallback((busType: 'input' | 'output', slotIndex: number, component: KitComponent) => {
    setArchitecture((prev) => {
      const key = busType === 'input' ? 'inputConditioners' : 'outputConditioners';
      const currentList = prev[key] || [null, null, null];
      const updated = [...currentList];
      updated[slotIndex] = component;
      return {
        ...prev,
        [key]: updated,
      };
    });

    setDraggedCategory(null);
    setErrorMessage(null);
    setStatusMessage(`Attached ${component.name} to ${busType.toUpperCase()} Channel ${slotIndex + 1}`);
    setIsErrorStatus(false);
  }, []);

  // Remove Conditioner Addon Handler
  const handleRemoveConditioner = useCallback((busType: 'input' | 'output', slotIndex: number) => {
    setArchitecture((prev) => {
      const key = busType === 'input' ? 'inputConditioners' : 'outputConditioners';
      const currentList = prev[key] || [null, null, null];
      const updated = [...currentList];
      updated[slotIndex] = null;
      return {
        ...prev,
        [key]: updated,
      };
    });
    setStatusMessage(`Removed Add-on from ${busType.toUpperCase()} Channel ${slotIndex + 1}`);
  }, []);

  // Wire Connection Handlers (Free Tool Interactive Wiring)
  const handleConnectWire = useCallback((fromCategory: 'input' | 'board', fromSlot: number, toCategory: 'board' | 'output', toSlot: number) => {
    // Constraint: cannot connect input directly to output
    if (fromCategory === 'input' && toCategory === 'output') {
      const errorMsg = 'Direct connection from Input to Output is not allowed. Must connect Input ➔ Device and Device ➔ Output.';
      setErrorMessage(errorMsg);
      setStatusMessage(`Error: ${errorMsg}`);
      setIsErrorStatus(true);
      return;
    }

    setArchitecture((prev) => {
      const currentWires = prev.wires || [];
      const alreadyConnected = currentWires.some(
        (w) => w.fromCategory === fromCategory && w.fromSlot === fromSlot && w.toCategory === toCategory && w.toSlot === toSlot
      );
      if (alreadyConnected) return prev;

      const newWire: WireConnection = {
        id: `wire-${fromCategory}${fromSlot}-${toCategory}${toSlot}-${Date.now()}`,
        fromCategory,
        fromSlot,
        toCategory,
        toSlot,
        conditioner: null,
      };

      return {
        ...prev,
        wires: [...currentWires, newWire],
      };
    });

    setErrorMessage(null);
    setStatusMessage(`Connected ${fromCategory.toUpperCase()} Slot ${fromSlot + 1} ➔ ${toCategory.toUpperCase()} Slot ${toSlot + 1}`);
    setIsErrorStatus(false);
  }, []);

  const handleDisconnectWire = useCallback((wireId: string) => {
    setArchitecture((prev) => ({
      ...prev,
      wires: (prev.wires || []).filter((w) => w.id !== wireId),
    }));
    setStatusMessage('Disconnected wire connection');
    setIsErrorStatus(false);
  }, []);

  const handleAttachWireConditioner = useCallback((wireId: string, conditioner: KitComponent) => {
    setArchitecture((prev) => ({
      ...prev,
      wires: (prev.wires || []).map((w) => (w.id === wireId ? { ...w, conditioner } : w)),
    }));
    setStatusMessage(`Attached ${conditioner.name} to Wire Connection`);
    setIsErrorStatus(false);
  }, []);

  const handleRemoveWireConditioner = useCallback((wireId: string) => {
    setArchitecture((prev) => ({
      ...prev,
      wires: (prev.wires || []).map((w) => (w.id === wireId ? { ...w, conditioner: null } : w)),
    }));
    setStatusMessage('Removed Add-on from Wire Connection');
    setIsErrorStatus(false);
  }, []);

  // Component Selection (Highlights slot without resetting code variations)
  const handleSelectComponent = useCallback((component: KitComponent) => {
    setSelectedComponent(component);
    setStatusMessage(`Focused: ${component.name} (${component.category.toUpperCase()})`);
    setIsErrorStatus(false);
  }, []);

  // Variation Selection (Directly changes active code variation)
  const handleSelectVariation = useCallback((variation: CodeVariation) => {
    setSelectedVariation(variation);
    setStatusMessage(`Active Variation: ${variation.title}`);
  }, []);

  // Mode Selection Handler
  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode);
    setStatusMessage(`Switched to ${newMode === 'developer' ? 'Developer' : 'Educator'} Mode`);
    setIsErrorStatus(false);
  }, []);

  // Remove Component from Slot
  const handleRemoveComponent = useCallback((category: ComponentCategory, slotIndex: number) => {
    setArchitecture((prev) => {
      const key = category === 'input' ? 'inputs' : category === 'board' ? 'boards' : 'outputs';
      const targetComponent = prev[key][slotIndex];
      if (selectedComponent && targetComponent && selectedComponent.id === targetComponent.id) {
        setSelectedComponent(null);
      }
      const updatedSlots = [...prev[key]];
      updatedSlots[slotIndex] = null;

      // Clean up connected wires
      const cleanWires = (prev.wires || []).filter((w) => {
        if (w.fromCategory === category && w.fromSlot === slotIndex) return false;
        if (w.toCategory === category && w.toSlot === slotIndex) return false;
        return true;
      });

      return {
        ...prev,
        [key]: updatedSlots,
        wires: cleanWires,
      };
    });
    setStatusMessage(`Cleared ${category.toUpperCase()} Slot ${slotIndex + 1}`);
  }, [selectedComponent]);

  // Reset Architecture Everything
  const handleReset = useCallback(() => {
    setArchitecture({
      inputs: [null, null, null],
      boards: [null, null, null],
      outputs: [null, null, null],
      inputConditioners: [null, null, null],
      outputConditioners: [null, null, null],
      wires: [],
      conditioner: [null, null, null],
    });
    setSelectedComponent(null);
    setSelectedVariation(null);
    setErrorMessage(null);
    setStatusMessage('System Architecture cleared');
    setIsErrorStatus(false);
  }, []);

  // Load Complete Demo System (Tactile Button in Input 0, ESP32 in Board 1, 220Ω Resistor in Output Conditioner 0, LED in Output 0)
  const handleLoadDemo = useCallback(() => {
    const buttonComp = components.find((c) => c.id === 'tactile-button') || null;
    const esp32Comp = components.find((c) => c.id === 'esp32') || null;
    const resistorComp = components.find((c) => c.id === 'resistor-220') || null;
    const ledComp = components.find((c) => c.id === 'led') || null;

    setArchitecture({
      inputs: [buttonComp, null, null],
      boards: [null, esp32Comp, null],
      outputs: [ledComp, null, null],
      inputConditioners: [null, null, null],
      outputConditioners: [resistorComp, null, null],
      wires: [
        {
          id: 'demo-wire-in0-b1',
          fromCategory: 'input',
          fromSlot: 0,
          toCategory: 'board',
          toSlot: 1,
          conditioner: null,
        },
        {
          id: 'demo-wire-b1-out0',
          fromCategory: 'board',
          fromSlot: 1,
          toCategory: 'output',
          toSlot: 0,
          conditioner: resistorComp,
        },
      ],
      conditioner: [resistorComp, null, null],
    });

    if (buttonComp) {
      setSelectedComponent(buttonComp);
      const buttonVars = variations.filter((v) => v.componentId === buttonComp.id);
      if (buttonVars.length > 0) {
        setSelectedVariation(buttonVars[0]);
      }
    }

    setErrorMessage(null);
    setStatusMessage('Loaded Demo: Button ➔ ESP32 ➔ 220Ω Resistor ➔ LED');
    setIsErrorStatus(false);
  }, [components, variations]);

  // Invalid Drop Warning Trigger
  const handleInvalidDropAttempt = useCallback((message: string) => {
    setErrorMessage(message);
    setStatusMessage(`Error: ${message}`);
    setIsErrorStatus(true);

    setTimeout(() => {
      setErrorMessage((current) => (current === message ? null : current));
    }, 4000);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-100 text-zinc-900 font-sans overflow-hidden">
      {/* Top Application Header (Hidden in Educator Mode) */}
      {mode !== 'educator' && (
        <Header onReset={handleReset} onLoadDemo={handleLoadDemo} />
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Component Library Sidebar */}
        <ComponentLibrary
          components={components}
          onAddComponent={handleAddComponent}
          onDeleteComponent={handleDeleteComponent}
          onDragStartComponent={handleDragStart}
          onDragEndComponent={handleDragEnd}
          mode={mode}
        />

        {/* Center & Right Canvas: Flexible Cards Layout */}
        <main className="flex-1 flex items-stretch gap-4 p-4 bg-zinc-100/90 overflow-x-auto overflow-y-auto relative custom-scrollbar select-none">
          {/* Blueprint Grid Background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

          {/* CARD 1: PIPELINE / SYSTEM ARCHITECTURE VISUALIZER */}
          {(expandedCard === null || expandedCard === 'pipeline') && (
            <ArchitectureCanvas
              architecture={architecture}
              selectedComponent={selectedComponent}
              draggedCategory={draggedCategory}
              errorMessage={errorMessage}
              isExpanded={expandedCard === 'pipeline'}
              onToggleExpand={() => setExpandedCard((curr) => (curr === 'pipeline' ? null : 'pipeline'))}
              onDropComponent={handleDropComponent}
              onSelectComponent={handleSelectComponent}
              onRemoveComponent={handleRemoveComponent}
              onDropConditioner={handleDropConditioner}
              onRemoveConditioner={handleRemoveConditioner}
              onConnectWire={handleConnectWire}
              onDisconnectWire={handleDisconnectWire}
              onAttachWireConditioner={handleAttachWireConditioner}
              onRemoveWireConditioner={handleRemoveWireConditioner}
              onInvalidDropAttempt={handleInvalidDropAttempt}
              onDismissError={() => setErrorMessage(null)}
              mode={mode}
            />
          )}

          {/* Compact Mini Switcher when Pipeline is expanded */}
          {expandedCard === 'pipeline' && (
            <button
              onClick={() => setExpandedCard('code')}
              className="absolute right-6 top-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-900 text-white text-xs font-medium backdrop-blur-xs border border-zinc-700 shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <CodeIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Switch to Code Editor</span>
            </button>
          )}

          {/* CARD 2: CODE VARIATIONS & CODE EDITOR */}
          {(expandedCard === null || expandedCard === 'code') && (
            <CodeVariationCard
              architecture={architecture}
              selectedComponent={selectedComponent}
              selectedVariation={selectedVariation}
              allVariations={variations}
              isExpanded={expandedCard === 'code'}
              onToggleExpand={() => setExpandedCard((curr) => (curr === 'code' ? null : 'code'))}
              onSelectVariation={handleSelectVariation}
              onAddCustomCase={handleAddCustomCase}
              onUpdateCase={handleUpdateCase}
              onDeleteCustomCase={handleDeleteCustomCase}
              mode={mode}
            />
          )}

          {/* Compact Mini Switcher when Code is expanded */}
          {expandedCard === 'code' && (
            <button
              onClick={() => setExpandedCard('pipeline')}
              className="absolute left-6 top-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-900 text-white text-xs font-medium backdrop-blur-xs border border-zinc-700 shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <CpuIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Switch to Pipeline</span>
            </button>
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        architecture={architecture}
        statusMessage={statusMessage || undefined}
        isError={isErrorStatus}
        mode={mode}
        onModeChange={handleModeChange}
      />
    </div>
  );
}

