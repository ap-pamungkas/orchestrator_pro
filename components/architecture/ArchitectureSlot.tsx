import React, { useState } from 'react';
import Image from 'next/image';
import { KitComponent, ComponentCategory } from '@/types';
import { PlusIcon, Trash2Icon, AlertTriangleIcon } from '../icons/Icons';

interface ArchitectureSlotProps {
  category: ComponentCategory;
  slotIndex: number;
  component: KitComponent | null;
  selectedComponent: KitComponent | null;
  draggedCategory: ComponentCategory | null;
  onDropComponent: (category: ComponentCategory, slotIndex: number, component: KitComponent) => void;
  onSelectComponent: (component: KitComponent) => void;
  onRemoveComponent: (category: ComponentCategory, slotIndex: number) => void;
  onInvalidDropAttempt?: (message: string) => void;
  prominent?: boolean; // For center board slot
}

export const ArchitectureSlot: React.FC<ArchitectureSlotProps> = ({
  category,
  slotIndex,
  component,
  selectedComponent,
  draggedCategory,
  onDropComponent,
  onSelectComponent,
  onRemoveComponent,
  onInvalidDropAttempt,
  prominent = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const isValidDrag = draggedCategory === category;
  const isInvalidDrag = draggedCategory !== null && !isValidDrag;
  const isSelected = selectedComponent !== null && component !== null && selectedComponent.id === component.id;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const droppedComponent = JSON.parse(rawData) as KitComponent;

      if (droppedComponent.category !== category) {
        const errorMsg = `Invalid Component: ${droppedComponent.name} (${droppedComponent.category.toUpperCase()}) cannot be placed in the ${category.toUpperCase()} slot.`;
        if (onInvalidDropAttempt) {
          onInvalidDropAttempt(errorMsg);
        }
        return;
      }

      onDropComponent(category, slotIndex, droppedComponent);
    } catch (err) {
      console.error('Error parsing dropped component data', err);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Top Connection Terminal Port */}
      {category !== 'input' && (
        <div
          className={`absolute -top-1.5 w-2.5 h-2.5 rounded-full z-10 transition-all duration-300 border ${
            component
              ? category === 'board'
                ? 'bg-blue-500 border-blue-200 ring-2 ring-blue-100 shadow-[0_0_6px_rgba(59,130,246,0.6)]'
                : 'bg-emerald-500 border-emerald-200 ring-2 ring-emerald-100 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
              : 'bg-zinc-300 border-zinc-200'
          }`}
          title={component ? `${component.name} Input Port` : 'Port Disconnected'}
        />
      )}

      {/* Main Slot Body */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative transition-all duration-200 flex flex-col items-center justify-between ${
          prominent ? 'w-26 h-28 sm:w-30 sm:h-32 rounded-xl' : 'w-20 h-22 sm:w-24 sm:h-24 rounded-lg'
        } ${
          isDragOver
            ? isValidDrag
              ? 'border-2 border-dashed border-blue-500 bg-blue-50/70 ring-4 ring-blue-100 scale-105 shadow-md'
              : 'border-2 border-dashed border-red-500 bg-red-50/70 ring-4 ring-red-100 scale-105 shadow-md'
            : component
              ? isSelected
                ? 'border-2 border-blue-500 bg-white ring-4 ring-blue-100 shadow-md shadow-blue-500/10'
                : 'border border-zinc-200 hover:border-zinc-300 bg-white shadow-2xs hover:shadow-xs'
              : 'border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/60'
        }`}
      >
        {/* EMPTY SLOT */}
        {!component ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-1.5 cursor-default select-none group">
            {isDragOver && isInvalidDrag ? (
              <div className="flex flex-col items-center text-red-500">
                <AlertTriangleIcon className="w-4 h-4" />
                <span className="text-[8px] font-bold mt-0.5">{category.toUpperCase()}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-300 group-hover:text-zinc-500 transition-colors">
                <div className="w-5 h-5 rounded-full bg-zinc-200/70 flex items-center justify-center mb-1">
                  <PlusIcon className="w-3 h-3 text-zinc-500" />
                </div>
                <span className="text-[8.5px] font-mono text-zinc-400 font-medium">Slot {slotIndex + 1}</span>
              </div>
            )}
          </div>
        ) : (
          /* OCCUPIED SLOT */
          <div
            onClick={() => onSelectComponent(component)}
            className="w-full h-full p-1.5 flex flex-col items-center justify-between text-center cursor-pointer group select-none relative"
          >
            {/* Top Bar: Mini status dot & delete action */}
            <div className="w-full flex items-center justify-between">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500'
                }`}
              />

              <div className="flex items-center gap-1">
                {component.defaultGpio && (
                  <span className="text-[8px] font-mono text-zinc-500 bg-zinc-100 px-1 py-0.2 rounded border border-zinc-200/60">
                    GP{component.defaultGpio}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveComponent(category, slotIndex);
                  }}
                  title="Remove component"
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-600 p-0.5 rounded transition-all cursor-pointer"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Hardware Thumbnail */}
            <div
              className={`relative flex items-center justify-center ${
                prominent ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-10 h-10 sm:w-11 sm:h-11'
              } group-hover:scale-105 transition-transform`}
            >
              <Image
                src={component.image}
                alt={component.name}
                width={prominent ? 64 : 44}
                height={prominent ? 64 : 44}
                className="object-contain max-h-full max-w-full drop-shadow-sm"
                unoptimized
                priority
              />
            </div>

            {/* Component Name */}
            <div className="w-full">
              <p
                className={`font-semibold text-zinc-900 truncate leading-none ${
                  prominent ? 'text-[11px]' : 'text-[9.5px]'
                } ${isSelected ? 'text-blue-600' : ''}`}
              >
                {component.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Connection Terminal Port */}
      {category !== 'output' && (
        <div
          className={`absolute -bottom-1.5 w-2.5 h-2.5 rounded-full z-10 transition-all duration-300 border ${
            component
              ? category === 'input'
                ? 'bg-blue-500 border-blue-200 ring-2 ring-blue-100 shadow-[0_0_6px_rgba(59,130,246,0.6)]'
                : 'bg-emerald-500 border-emerald-200 ring-2 ring-emerald-100 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
              : 'bg-zinc-300 border-zinc-200'
          }`}
          title={component ? `${component.name} Output Port` : 'Port Disconnected'}
        />
      )}
    </div>
  );
};
