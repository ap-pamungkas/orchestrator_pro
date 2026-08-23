import React, { useState } from 'react';
import Image from 'next/image';
import { KitComponent, ComponentCategory } from '@/types';
import { StatusLedGroup } from '../common/StatusLedGroup';
import { AddComponentModal } from './AddComponentModal';
import {
  LayersIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TerminalIcon,
  GripVerticalIcon,
  PlusIcon,
  Trash2Icon,
} from '../icons/Icons';

interface ComponentLibraryProps {
  components: KitComponent[];
  onAddComponent: (component: KitComponent) => void;
  onDeleteComponent: (componentId: string) => void;
  onDragStartComponent: (component: KitComponent) => void;
  onDragEndComponent: () => void;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  components,
  onAddComponent,
  onDeleteComponent,
  onDragStartComponent,
  onDragEndComponent,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<ComponentCategory, boolean>>({
    input: false,
    board: false,
    output: false,
    conditioner: false,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddCategory, setSelectedAddCategory] = useState<ComponentCategory>('input');

  const toggleSection = (category: ComponentCategory) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleOpenAddModal = (category: ComponentCategory = 'input', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAddCategory(category);
    setIsAddModalOpen(true);
  };

  const categories: { id: ComponentCategory; label: string; count: number }[] = [
    { id: 'input', label: 'INPUT', count: components.filter((c) => c.category === 'input').length },
    { id: 'board', label: 'Device', count: components.filter((c) => c.category === 'board').length },
    { id: 'output', label: 'OUTPUT', count: components.filter((c) => c.category === 'output').length },
    { id: 'conditioner', label: 'Conditioner', count: components.filter((c) => c.category === 'conditioner').length },
  ];

  return (
    <>
      <aside className="w-[340px] sm:w-[370px] lg:w-[390px] flex-shrink-0 bg-zinc-50 border-r border-zinc-200 flex flex-col h-full select-none">
        {/* Header */}
        <div className="p-3 border-b border-zinc-200/80 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="w-4 h-4 text-zinc-500" />
            <h2 className="font-semibold text-xs tracking-wider text-zinc-800 uppercase">
              KIT COMPONENT
            </h2>
            <StatusLedGroup />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60">
              {components.length}
            </span>
          </div>
        </div>

        {/* Component Category Groups (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
          {categories.map((category) => {
            const isCollapsed = collapsedSections[category.id];
            const categoryComponents = components.filter((c) => c.category === category.id);

            return (
              <div
                key={category.id}
                className="bg-white rounded-lg border border-zinc-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-all"
              >
                {/* Category Header Accordion */}
                <div
                  onClick={() => toggleSection(category.id)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50/70 hover:bg-zinc-100/70 flex items-center justify-between text-left transition-colors border-b border-zinc-200/50 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    {isCollapsed ? (
                      <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span className="font-bold text-[11px] tracking-wide text-zinc-700 uppercase">
                      {category.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9.5px] text-zinc-400 font-mono">
                      ({category.count})
                    </span>
                    {/* Quick Add Button for this Category */}
                    <button
                      onClick={(e) => handleOpenAddModal(category.id, e)}
                      title={`Add new ${category.label} component`}
                      className="w-4 h-4 rounded hover:bg-blue-100 hover:text-blue-700 text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Component Cards Grid (4 Columns) */}
                {!isCollapsed && (
                  <div className="p-2 grid grid-cols-4 gap-1.5">
                    {categoryComponents.map((component) => (
                      <div
                        key={component.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify(component));
                          e.dataTransfer.effectAllowed = 'copyMove';
                          onDragStartComponent(component);
                        }}
                        onDragEnd={() => {
                          onDragEndComponent();
                        }}
                        title={`${component.name} (${component.type || component.category})`}
                        className="group relative bg-white rounded-md border border-zinc-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 p-1.5 cursor-grab active:cursor-grabbing flex flex-col items-center text-center select-none"
                      >
                        {/* Custom Badge or Drag Cue */}
                        <div className="absolute top-0.5 left-0.5 flex items-center gap-1 z-10">
                          {component.isCustom && (
                            <span className="text-[6.5px] font-mono font-bold bg-amber-100 text-amber-800 px-0.5 py-0.2 rounded border border-amber-200/80">
                              CUSTOM
                            </span>
                          )}
                        </div>

                        <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 z-10">
                          {component.isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteComponent(component.id);
                              }}
                              title="Delete custom component"
                              className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-600 p-0.5 rounded transition-all cursor-pointer"
                            >
                              <Trash2Icon className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVerticalIcon className="w-2.5 h-2.5 text-zinc-400" />
                          </div>
                        </div>

                        {/* Hardware Image Container */}
                        <div className="w-12 h-12 sm:w-13 sm:h-13 relative mb-1 flex items-center justify-center bg-zinc-50/80 rounded border border-zinc-100 p-0.5 group-hover:scale-105 transition-transform">
                          <Image
                            src={component.image}
                            alt={component.name}
                            width={48}
                            height={48}
                            className="object-contain max-h-11 max-w-11 drop-shadow-sm"
                            unoptimized
                            priority
                          />
                        </div>

                        {/* Component Info */}
                        <span className="font-semibold text-[10px] sm:text-[10.5px] text-zinc-800 line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors w-full">
                          {component.name}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-400 mt-0.5 tracking-wider uppercase truncate max-w-full">
                          {component.pinInfo || component.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Footer Tool Links */}
        <div className="p-3 border-t border-zinc-200 bg-white flex flex-col gap-1.5 text-xs text-zinc-600">
          <button
            onClick={() => handleOpenAddModal('input')}
            className="flex items-center gap-2 px-2 py-1.5 rounded bg-zinc-100/80 hover:bg-blue-50 text-blue-700 font-medium transition-colors cursor-pointer text-left border border-zinc-200/80"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Create Custom Component</span>
          </button>
          {/* <button
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer text-left"
          >
            <HelpCircleIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>Help & Pinout Guide</span>
          </button> */}
          <button
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer text-left"
          >
            <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>Console / Serial Monitor</span>
          </button>
        </div>
      </aside>

      {/* Add Component Modal Dialog */}
      <AddComponentModal
        isOpen={isAddModalOpen}
        initialCategory={selectedAddCategory}
        onClose={() => setIsAddModalOpen(false)}
        onAddComponent={onAddComponent}
      />
    </>
  );
};
