import React, { useState } from 'react';
import { KitComponent, ComponentCategory } from '@/types';
import { AlertTriangleIcon, PlusIcon } from '../icons/Icons';

interface ConditionerSlotProps {
  busType: 'input' | 'output';
  slotIndex: number;
  component: KitComponent | null;
  isRequired: boolean;
  requiredName?: string;
  draggedCategory: ComponentCategory | null;
  onDropConditioner: (busType: 'input' | 'output', slotIndex: number, component: KitComponent) => void;
  onRemoveConditioner: (busType: 'input' | 'output', slotIndex: number) => void;
  onInvalidDropAttempt: (message: string) => void;
}

export const ConditionerSlot: React.FC<ConditionerSlotProps> = ({
  busType,
  slotIndex,
  component,
  isRequired,
  requiredName = 'Resistor',
  draggedCategory,
  onDropConditioner,
  onRemoveConditioner,
  onInvalidDropAttempt,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const isValidDrag = draggedCategory === 'conditioner';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      const droppedComponent: KitComponent = JSON.parse(data);

      if (droppedComponent.category !== 'conditioner') {
        onInvalidDropAttempt(
          `Only Conditioner / Add-on components (e.g. Resistor) can be placed in this inline port.`
        );
        return;
      }

      onDropConditioner(busType, slotIndex, droppedComponent);
    } catch {
      onInvalidDropAttempt('Failed to attach conditioner component.');
    }
  };

  return (
    <div className="relative group flex items-center justify-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? isValidDrag
              ? 'border-2 border-blue-500 bg-blue-50 ring-2 ring-blue-200 scale-110'
              : 'border-2 border-red-500 bg-red-50 ring-2 ring-red-200 scale-110'
            : component
              ? 'border border-blue-500 bg-blue-50/90 text-blue-700 shadow-2xs'
              : isRequired
                ? 'border-2 border-dashed border-amber-500 bg-amber-50/90 text-amber-700 animate-pulse ring-2 ring-amber-200/60 shadow-xs'
                : 'border border-dashed border-zinc-300 hover:border-zinc-400 bg-white/90 hover:bg-zinc-50 text-zinc-400'
        }`}
        title={
          component
            ? `${component.name} (${component.type})`
            : isRequired
              ? `REQUIRED: ${requiredName} needed for this channel to work!`
              : 'Add-on / Conditioner Slot (Optional: Resistor/Capacitor)'
        }
      >
        {component ? (
          /* Filled State */
          <div className="flex flex-col items-center justify-center p-0.5 relative w-full h-full">
            <span className="font-mono text-[8px] font-bold text-blue-600 leading-none">
              ADD
            </span>
            <span className="text-[7.5px] font-mono font-medium text-zinc-800 truncate max-w-[24px] leading-none mt-0.5">
              {component.id.includes('220') ? '220Ω' : component.id.includes('10k') ? '10k' : '100n'}
            </span>

            {/* Remove Action Button on Hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveConditioner(busType, slotIndex);
              }}
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs text-[8px] cursor-pointer"
              title="Remove add-on"
            >
              ✕
            </button>
          </div>
        ) : isRequired ? (
          /* Required Warning State */
          <div className="flex flex-col items-center justify-center">
            <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[6.5px] font-mono font-bold text-amber-700 leading-none mt-0.5">
              NEED
            </span>
          </div>
        ) : (
          /* Empty Optional State with Plus Icon */
          <div className="flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
            <PlusIcon className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600" />
          </div>
        )}
      </div>

      {/* Hover Floating Tooltip Badge */}
      <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-30 whitespace-nowrap bg-zinc-900 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded shadow-md">
        {component
          ? component.name
          : isRequired
            ? `⚠️ ${requiredName} Required`
            : 'Add-on (Optional)'}
      </div>
    </div>
  );
};
