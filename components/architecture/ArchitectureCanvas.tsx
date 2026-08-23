import React from 'react';
import { KitComponent, ComponentCategory, ArchitectureState } from '@/types';
import { ArchitectureSlot } from './ArchitectureSlot';
import { ConditionerSlot } from './ConditionerSlot';
import { StatusLedGroup } from '../common/StatusLedGroup';
import { CpuIcon, AlertTriangleIcon, MaximizeIcon, MinimizeIcon } from '../icons/Icons';

interface ArchitectureCanvasProps {
  architecture: ArchitectureState;
  selectedComponent: KitComponent | null;
  draggedCategory: ComponentCategory | null;
  errorMessage: string | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onDropComponent: (category: ComponentCategory, slotIndex: number, component: KitComponent) => void;
  onSelectComponent: (component: KitComponent) => void;
  onRemoveComponent: (category: ComponentCategory, slotIndex: number) => void;
  onDropConditioner: (busType: 'input' | 'output', slotIndex: number, component: KitComponent) => void;
  onRemoveConditioner: (busType: 'input' | 'output', slotIndex: number) => void;
  onInvalidDropAttempt: (message: string) => void;
  onDismissError: () => void;
}

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  architecture,
  selectedComponent,
  draggedCategory,
  errorMessage,
  isExpanded = false,
  onToggleExpand,
  onDropComponent,
  onSelectComponent,
  onRemoveComponent,
  onDropConditioner,
  onRemoveConditioner,
  onInvalidDropAttempt,
  onDismissError,
}) => {
  const hasBoard = architecture.boards.some(Boolean);

  const inputConditioners = architecture.inputConditioners || [null, null, null];
  const outputConditioners = architecture.outputConditioners || [null, null, null];

  // Cable & Conditioner validation logic for Input Channels
  const isInput0Req = Boolean(
    architecture.inputs[0]?.requiredConditionerId &&
    (!inputConditioners[0] || inputConditioners[0].category !== 'conditioner')
  );
  const isInput1Req = Boolean(
    architecture.inputs[1]?.requiredConditionerId &&
    (!inputConditioners[1] || inputConditioners[1].category !== 'conditioner')
  );
  const isInput2Req = Boolean(
    architecture.inputs[2]?.requiredConditionerId &&
    (!inputConditioners[2] || inputConditioners[2].category !== 'conditioner')
  );

  const isInput0Active = Boolean(architecture.inputs[0]) && hasBoard && !isInput0Req;
  const isInput1Active = Boolean(architecture.inputs[1]) && hasBoard && !isInput1Req;
  const isInput2Active = Boolean(architecture.inputs[2]) && hasBoard && !isInput2Req;

  // Cable & Conditioner validation logic for Output Channels
  const isOutput0Req = Boolean(
    architecture.outputs[0]?.requiredConditionerId &&
    (!outputConditioners[0] || outputConditioners[0].category !== 'conditioner')
  );
  const isOutput1Req = Boolean(
    architecture.outputs[1]?.requiredConditionerId &&
    (!outputConditioners[1] || outputConditioners[1].category !== 'conditioner')
  );
  const isOutput2Req = Boolean(
    architecture.outputs[2]?.requiredConditionerId &&
    (!outputConditioners[2] || outputConditioners[2].category !== 'conditioner')
  );

  const isOutput0Active = hasBoard && Boolean(architecture.outputs[0]) && !isOutput0Req;
  const isOutput1Active = hasBoard && Boolean(architecture.outputs[1]) && !isOutput1Req;
  const isOutput2Active = hasBoard && Boolean(architecture.outputs[2]) && !isOutput2Req;

  return (
    <div
      className={`${
        isExpanded
          ? 'w-full flex-1 h-full'
          : 'w-[350px] sm:w-[380px] lg:w-[410px] flex-shrink-0'
      } flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden select-none transition-all duration-300`}
    >
      {/* Card Header */}
      <div className="p-3 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CpuIcon className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-[11px] tracking-wider text-zinc-800 uppercase">
            Pipeline
          </h2>
          <StatusLedGroup />
          <span className="text-[9px] font-mono bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200 font-semibold">
            3×3 + Addons
          </span>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-zinc-100 text-[10px] font-medium text-zinc-600 border border-zinc-200 transition-colors cursor-pointer shadow-2xs"
              title={isExpanded ? 'Restore card size' : 'Expand Pipeline to full canvas'}
            >
              {isExpanded ? (
                <MinimizeIcon className="w-3 h-3" />
              ) : (
                <MaximizeIcon className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mx-3 mt-2 flex items-center justify-between gap-1.5 bg-red-50 text-red-700 text-[10px] px-2.5 py-1.5 rounded-lg border border-red-200 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span className="font-medium truncate max-w-[240px]">{errorMessage}</span>
          </div>
          <button onClick={onDismissError} className="text-red-400 hover:text-red-700 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 3-Layer Pipeline Content */}
      <div className={`p-4 flex-1 flex flex-col items-center justify-between overflow-y-auto custom-scrollbar ${isExpanded ? 'max-w-2xl mx-auto w-full' : 'w-full'}`}>

        {/* 1. INPUT LAYER (3 Slots) */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
              Input
            </span>
            <span className="text-[9px] font-mono text-zinc-400">
              {architecture.inputs.filter(Boolean).length}/3 Connected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full justify-items-center">
            {[0, 1, 2].map((slotIdx) => (
              <ArchitectureSlot
                key={`input-${slotIdx}`}
                category="input"
                slotIndex={slotIdx}
                component={architecture.inputs[slotIdx]}
                selectedComponent={selectedComponent}
                draggedCategory={draggedCategory}
                onDropComponent={onDropComponent}
                onSelectComponent={onSelectComponent}
                onRemoveComponent={onRemoveComponent}
                onInvalidDropAttempt={onInvalidDropAttempt}
              />
            ))}
          </div>
        </div>

        {/* DYNAMIC CABLES & INLINE CONDITIONER ADD-ON SLOTS: INPUT ➔ MCU BOARD */}
        <div className="w-full h-14 relative my-1 flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 56" fill="none">
            {/* Cable 0: Input Slot 0 (x=50) ➔ MCU Center (x=130) */}
            {isInput0Active && (
              <path
                d="M 50 0 C 50 26, 120 30, 130 56"
                stroke="#60a5fa"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.35"
              />
            )}
            <path
              d="M 50 0 C 50 26, 120 30, 130 56"
              stroke={isInput0Active ? '#2563eb' : isInput0Req ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={isInput0Active ? 2.5 : 1.5}
              strokeDasharray={isInput0Active ? '6,3' : '4,4'}
              strokeLinecap="round"
              className={isInput0Active ? 'cable-flow-active-blue' : ''}
            />

            {/* Cable 1: Input Slot 1 (x=150) ➔ MCU Center (x=150) */}
            {isInput1Active && (
              <path
                d="M 150 0 L 150 56"
                stroke="#60a5fa"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.35"
              />
            )}
            <path
              d="M 150 0 L 150 56"
              stroke={isInput1Active ? '#2563eb' : isInput1Req ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={isInput1Active ? 2.5 : 1.5}
              strokeDasharray={isInput1Active ? '6,3' : '4,4'}
              strokeLinecap="round"
              className={isInput1Active ? 'cable-flow-active-blue' : ''}
            />

            {/* Cable 2: Input Slot 2 (x=250) ➔ MCU Center (x=170) */}
            {isInput2Active && (
              <path
                d="M 250 0 C 250 26, 180 30, 170 56"
                stroke="#60a5fa"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.35"
              />
            )}
            <path
              d="M 250 0 C 250 26, 180 30, 170 56"
              stroke={isInput2Active ? '#2563eb' : isInput2Req ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={isInput2Active ? 2.5 : 1.5}
              strokeDasharray={isInput2Active ? '6,3' : '4,4'}
              strokeLinecap="round"
              className={isInput2Active ? 'cable-flow-active-blue' : ''}
            />

            {/* Signal Pulse Nodes */}
            {isInput0Active && <circle cx="50" cy="14" r="3.5" fill="#2563eb" className="animate-pulse" />}
            {isInput1Active && <circle cx="150" cy="28" r="3.5" fill="#2563eb" className="animate-pulse" />}
            {isInput2Active && <circle cx="250" cy="14" r="3.5" fill="#2563eb" className="animate-pulse" />}
          </svg>

          {/* 3 Mini Inline Conditioner Slots */}
          <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-10 pointer-events-none">
            <div className="pointer-events-auto">
              <ConditionerSlot
                busType="input"
                slotIndex={0}
                component={inputConditioners[0]}
                isRequired={isInput0Req}
                requiredName={architecture.inputs[0]?.requiredConditionerName}
                draggedCategory={draggedCategory}
                onDropConditioner={onDropConditioner}
                onRemoveConditioner={onRemoveConditioner}
                onInvalidDropAttempt={onInvalidDropAttempt}
              />
            </div>
            <div className="pointer-events-auto">
              <ConditionerSlot
                busType="input"
                slotIndex={1}
                component={inputConditioners[1]}
                isRequired={isInput1Req}
                requiredName={architecture.inputs[1]?.requiredConditionerName}
                draggedCategory={draggedCategory}
                onDropConditioner={onDropConditioner}
                onRemoveConditioner={onRemoveConditioner}
                onInvalidDropAttempt={onInvalidDropAttempt}
              />
            </div>
            <div className="pointer-events-auto">
              <ConditionerSlot
                busType="input"
                slotIndex={2}
                component={inputConditioners[2]}
                isRequired={isInput2Req}
                requiredName={architecture.inputs[2]?.requiredConditionerName}
                draggedCategory={draggedCategory}
                onDropConditioner={onDropConditioner}
                onRemoveConditioner={onRemoveConditioner}
                onInvalidDropAttempt={onInvalidDropAttempt}
              />
            </div>
          </div>
        </div>

        {/* 2. Device (3 Slots) */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
              Device
            </span>
            <span className="text-[9px] font-mono text-zinc-400">
              {architecture.boards.filter(Boolean).length}/3 Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full justify-items-center items-center">
            {/* Board Slot 0 */}
            <ArchitectureSlot
              category="board"
              slotIndex={0}
              component={architecture.boards[0]}
              selectedComponent={selectedComponent}
              draggedCategory={draggedCategory}
              onDropComponent={onDropComponent}
              onSelectComponent={onSelectComponent}
              onRemoveComponent={onRemoveComponent}
              onInvalidDropAttempt={onInvalidDropAttempt}
            />

            {/* Board Slot 1 (Center Primary Core) */}
            <ArchitectureSlot
              category="board"
              slotIndex={1}
              component={architecture.boards[1]}
              selectedComponent={selectedComponent}
              draggedCategory={draggedCategory}
              onDropComponent={onDropComponent}
              onSelectComponent={onSelectComponent}
              onRemoveComponent={onRemoveComponent}
              onInvalidDropAttempt={onInvalidDropAttempt}
              prominent={true}
            />

            {/* Board Slot 2 */}
            <ArchitectureSlot
              category="board"
              slotIndex={2}
              component={architecture.boards[2]}
              selectedComponent={selectedComponent}
              draggedCategory={draggedCategory}
              onDropComponent={onDropComponent}
              onSelectComponent={onSelectComponent}
              onRemoveComponent={onRemoveComponent}
              onInvalidDropAttempt={onInvalidDropAttempt}
            />
          </div>
        </div>

        {/* DYNAMIC CABLES & INLINE CONDITIONER ADD-ON SLOTS: MCU BOARD ➔ OUTPUT */}
        <div className="w-full h-14 relative my-1 flex items-center justify-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 56" fill="none">
            {/* Cable 0: MCU Center (x=130) ➔ Output Slot 0 (x=50) */}
            {isOutput0Active && (
              <path
                d="M 130 0 C 120 26, 50 30, 50 56"
                stroke="#34d399"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.35"
              />
            )}
            <path
              d="M 130 0 C 120 26, 50 30, 50 56"
              stroke={isOutput0Active ? '#059669' : isOutput0Req ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={isOutput0Active ? 2.5 : 1.5}
              strokeDasharray={isOutput0Active ? '6,3' : '4,4'}
              strokeLinecap="round"
              className={isOutput0Active ? 'cable-flow-active-emerald' : ''}
            />

            {/* Cable 1: MCU Center (x=150) ➔ Output Slot 1 (x=150) */}
            {isOutput1Active && (
              <path
                d="M 150 0 L 150 56"
                stroke="#34d399"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.35"
              />
            )}
            <path
              d="M 150 0 L 150 56"
              stroke={isOutput1Active ? '#059669' : isOutput1Req ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={isOutput1Active ? 2.5 : 1.5}
              strokeDasharray={isOutput1Active ? '6,3' : '4,4'}
              strokeLinecap="round"
              className={isOutput1Active ? 'cable-flow-active-emerald' : ''}
            />

            {/* Cable 2: MCU Center (x=170) ➔ Output Slot 2 (x=250) */}
            {isOutput2Active && (
              <path
                d="M 170 0 C 180 26, 250 30, 250 56"
                stroke="#34d399"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.35"
              />
            )}
            <path
              d="M 170 0 C 180 26, 250 30, 250 56"
              stroke={isOutput2Active ? '#059669' : isOutput2Req ? '#f59e0b' : '#cbd5e1'}
              strokeWidth={isOutput2Active ? 2.5 : 1.5}
              strokeDasharray={isOutput2Active ? '6,3' : '4,4'}
              strokeLinecap="round"
              className={isOutput2Active ? 'cable-flow-active-emerald' : ''}
            />

            {/* Signal Pulse Nodes */}
            {isOutput0Active && <circle cx="50" cy="42" r="3.5" fill="#059669" className="animate-pulse" />}
            {isOutput1Active && <circle cx="150" cy="28" r="3.5" fill="#059669" className="animate-pulse" />}
            {isOutput2Active && <circle cx="250" cy="42" r="3.5" fill="#059669" className="animate-pulse" />}
          </svg>

          {/* 3 Mini Inline Conditioner Slots */}
          <div className="absolute inset-0 flex items-center justify-between px-8 sm:px-10 pointer-events-none">
            <div className="pointer-events-auto">
              <ConditionerSlot
                busType="output"
                slotIndex={0}
                component={outputConditioners[0]}
                isRequired={isOutput0Req}
                requiredName={architecture.outputs[0]?.requiredConditionerName}
                draggedCategory={draggedCategory}
                onDropConditioner={onDropConditioner}
                onRemoveConditioner={onRemoveConditioner}
                onInvalidDropAttempt={onInvalidDropAttempt}
              />
            </div>
            <div className="pointer-events-auto">
              <ConditionerSlot
                busType="output"
                slotIndex={1}
                component={outputConditioners[1]}
                isRequired={isOutput1Req}
                requiredName={architecture.outputs[1]?.requiredConditionerName}
                draggedCategory={draggedCategory}
                onDropConditioner={onDropConditioner}
                onRemoveConditioner={onRemoveConditioner}
                onInvalidDropAttempt={onInvalidDropAttempt}
              />
            </div>
            <div className="pointer-events-auto">
              <ConditionerSlot
                busType="output"
                slotIndex={2}
                component={outputConditioners[2]}
                isRequired={isOutput2Req}
                requiredName={architecture.outputs[2]?.requiredConditionerName}
                draggedCategory={draggedCategory}
                onDropConditioner={onDropConditioner}
                onRemoveConditioner={onRemoveConditioner}
                onInvalidDropAttempt={onInvalidDropAttempt}
              />
            </div>
          </div>
        </div>

        {/* 3. OUTPUT LAYER (3 Slots) */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
              Output
            </span>
            <span className="text-[9px] font-mono text-zinc-400">
              {architecture.outputs.filter(Boolean).length}/3 Connected
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full justify-items-center">
            {[0, 1, 2].map((slotIdx) => (
              <ArchitectureSlot
                key={`output-${slotIdx}`}
                category="output"
                slotIndex={slotIdx}
                component={architecture.outputs[slotIdx]}
                selectedComponent={selectedComponent}
                draggedCategory={draggedCategory}
                onDropComponent={onDropComponent}
                onSelectComponent={onSelectComponent}
                onRemoveComponent={onRemoveComponent}
                onInvalidDropAttempt={onInvalidDropAttempt}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
