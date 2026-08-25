import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KitComponent, ComponentCategory, ArchitectureState, AppMode } from '@/types';
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
  onConnectWire?: (fromCategory: 'input' | 'board', fromSlot: number, toCategory: 'board' | 'output', toSlot: number) => void;
  onDisconnectWire?: (wireId: string) => void;
  onAttachWireConditioner?: (wireId: string, conditioner: KitComponent) => void;
  onRemoveWireConditioner?: (wireId: string) => void;
  onInvalidDropAttempt: (message: string) => void;
  onDismissError: () => void;
  mode?: AppMode;
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
  onConnectWire,
  onDisconnectWire,
  onAttachWireConditioner,
  onRemoveWireConditioner,
  onInvalidDropAttempt,
  onDismissError,
  mode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);

  // Exact Pixel Coordinates for all Terminal Ports (measured from DOM elements)
  const [portPositions, setPortPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Active Interactive Wire Drawing State
  const [drawingWire, setDrawingWire] = useState<{
    fromCategory: 'input' | 'board';
    fromSlot: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Measure Port Positions relative to the canvasContent container
  const updatePortPositions = useCallback(() => {
    if (!canvasContentRef.current) return;
    const containerRect = canvasContentRef.current.getBoundingClientRect();
    const ports = canvasContentRef.current.querySelectorAll<HTMLElement>('[data-port-id]');
    const positions: Record<string, { x: number; y: number }> = {};

    ports.forEach((el) => {
      const portId = el.getAttribute('data-port-id');
      if (portId) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0 || containerRect.width > 0) {
          positions[portId] = {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          };
        } else {
          // Synthetic fallback for test / headless environments
          const parts = portId.split('-');
          const category = parts[0];
          const slotIdx = parseInt(parts[1], 10) || 0;
          const isTop = parts[2] === 'top';
          const defaultX = slotIdx === 0 ? 50 : slotIdx === 1 ? 150 : 250;
          const defaultY =
            category === 'input'
              ? 50
              : category === 'board'
                ? isTop
                  ? 130
                  : 190
                : 270;
          positions[portId] = { x: defaultX, y: defaultY };
        }
      }
    });

    setPortPositions(positions);
  }, []);

  // Update port positions on mount, resize, and state changes
  useEffect(() => {
    updatePortPositions();
    const handleResize = () => updatePortPositions();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (canvasContentRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updatePortPositions();
      });
      observer.observe(canvasContentRef.current);
    }

    const rafId = requestAnimationFrame(updatePortPositions);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [updatePortPositions, architecture, isExpanded]);

  // Mouse move listener across document while drawing a wire
  useEffect(() => {
    if (!drawingWire) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasContentRef.current) return;
      const rect = canvasContentRef.current.getBoundingClientRect();
      setDrawingWire((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX - rect.left,
              currentY: e.clientY - rect.top,
            }
          : null
      );
    };

    const handleMouseUp = () => {
      setDrawingWire(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drawingWire]);

  // Start Drawing Wire from a Port
  const handleStartWire = (fromCategory: 'input' | 'board', slotIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!canvasContentRef.current) return;
    const containerRect = canvasContentRef.current.getBoundingClientRect();
    const portKey = `${fromCategory}-${slotIndex}-bottom`;
    const pos = portPositions[portKey];

    const startX = pos ? pos.x : e.clientX - containerRect.left;
    const startY = pos ? pos.y : e.clientY - containerRect.top;

    setDrawingWire({
      fromCategory,
      fromSlot: slotIndex,
      startX,
      startY,
      currentX: e.clientX - containerRect.left,
      currentY: e.clientY - containerRect.top,
    });
  };

  // Complete Wire on a Target Port
  const handleCompleteWire = (toCategory: 'board' | 'output', slotIndex: number) => {
    if (!drawingWire) return;

    // Constraint: Input directly to Output is strictly forbidden
    if (drawingWire.fromCategory === 'input' && toCategory !== 'board') {
      onInvalidDropAttempt('Koneksi tidak valid: Jalur Input harus terhubung ke Device/Board, bukan langsung ke Output.');
      setDrawingWire(null);
      return;
    }

    if (drawingWire.fromCategory === 'board' && toCategory !== 'output') {
      onInvalidDropAttempt('Koneksi tidak valid: Jalur Board harus terhubung ke Output.');
      setDrawingWire(null);
      return;
    }

    if (onConnectWire) {
      onConnectWire(drawingWire.fromCategory, drawingWire.fromSlot, toCategory, slotIndex);
    }
    setDrawingWire(null);
  };

  // Wires list
  const wires = architecture.wires || [];

  return (
    <div
      ref={containerRef}
      className={`${isExpanded
        ? 'w-full flex-1 h-full'
        : 'w-[350px] sm:w-[380px] lg:w-[410px] flex-shrink-0'
        } flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden select-none transition-all duration-300`}
    >
      {/* Card Header */}
      <div className="p-3 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CpuIcon className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-[11px] tracking-wider text-zinc-800 uppercase">
            Line
          </h2>
          <StatusLedGroup />
        </div>

        {/* Right Header Actions (Expand button - hidden in Educator Mode) */}
        <div className="flex items-center gap-1.5">
          {mode !== 'educator' && onToggleExpand && (
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

      {/* Main 3-Layer Pipeline Content with Unified Overlay Canvas */}
      <div className={`p-4 flex-1 flex flex-col items-center justify-between overflow-y-auto custom-scrollbar ${isExpanded ? 'max-w-2xl mx-auto w-full' : 'w-full'}`}>
        <div
          ref={canvasContentRef}
          className="relative w-full flex-1 flex flex-col items-center justify-between gap-8 sm:gap-10 py-2"
        >
          {/* UNIFIED FULL-CANVAS SVG OVERLAY (n8n / draw.io style with 0.000px gap) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            style={{ width: '100%', height: '100%' }}
            fill="none"
          >
            {/* Render all user-created wires with cubic Bezier curves directly between port coordinates */}
            {wires.map((wire) => {
              const startKey = `${wire.fromCategory}-${wire.fromSlot}-bottom`;
              const endKey = `${wire.toCategory}-${wire.toSlot}-top`;
              const start = portPositions[startKey];
              const end = portPositions[endKey];

              if (!start || !end) return null;

              const dy = end.y - start.y;
              const curvature = Math.max(25, Math.abs(dy) * 0.45);
              const pathData = `M ${start.x} ${start.y} C ${start.x} ${start.y + curvature}, ${end.x} ${end.y - curvature}, ${end.x} ${end.y}`;

              const isFromActive = Boolean(
                wire.fromCategory === 'input' ? architecture.inputs[wire.fromSlot] : architecture.boards[wire.fromSlot]
              );
              const isToActive = Boolean(
                wire.toCategory === 'board' ? architecture.boards[wire.toSlot] : architecture.outputs[wire.toSlot]
              );
              const isActive = isFromActive && isToActive;
              const isBlue = wire.fromCategory === 'input';

              return (
                <g key={wire.id}>
                  {/* Glowing ambient background cable (like n8n active connection) */}
                  {isActive && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isBlue ? '#60a5fa' : '#34d399'}
                      strokeWidth="7"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                  )}
                  {/* Main connection cable */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isActive ? (isBlue ? '#2563eb' : '#059669') : '#cbd5e1'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeLinecap="round"
                    className={isActive ? (isBlue ? 'cable-flow-active-blue' : 'cable-flow-active-emerald') : ''}
                  />
                  {/* Midpoint signal pulse indicator */}
                  {isActive && (
                    <circle
                      cx={(start.x + end.x) / 2}
                      cy={(start.y + end.y) / 2}
                      r="3.5"
                      fill={isBlue ? '#2563eb' : '#059669'}
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}

            {/* Live Interactive Wire Preview while user is pulling/dragging from a port */}
            {drawingWire && (() => {
              const startKey = `${drawingWire.fromCategory}-${drawingWire.fromSlot}-bottom`;
              const start = portPositions[startKey] || { x: drawingWire.startX, y: drawingWire.startY };

              const endX = drawingWire.currentX;
              const endY = drawingWire.currentY;
              const dy = Math.max(20, endY - start.y);
              const curvature = Math.max(20, dy * 0.45);
              const pathData = `M ${start.x} ${start.y} C ${start.x} ${start.y + curvature}, ${endX} ${endY - curvature}, ${endX} ${endY}`;

              return (
                <path
                  d={pathData}
                  fill="none"
                  stroke={drawingWire.fromCategory === 'input' ? '#3b82f6' : '#10b981'}
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              );
            })()}
          </svg>

          {/* INLINE CONDITIONER / DIRECT SLOTS (Positioned on the wire curve midpoint) */}
          {wires.map((wire) => {
            const startKey = `${wire.fromCategory}-${wire.fromSlot}-bottom`;
            const endKey = `${wire.toCategory}-${wire.toSlot}-top`;
            const start = portPositions[startKey];
            const end = portPositions[endKey];

            if (!start || !end) return null;

            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const comp = wire.fromCategory === 'input' ? architecture.inputs[wire.fromSlot] : architecture.outputs[wire.toSlot];
            const isReq = Boolean(comp && !wire.conditioner);

            return (
              <div
                key={`conditioner-wire-${wire.id}`}
                style={{ left: `${midX}px`, top: `${midY}px`, transform: 'translate(-50%, -50%)' }}
                className="absolute pointer-events-auto flex items-center gap-1 group/wire z-20"
              >
                <ConditionerSlot
                  busType={wire.fromCategory === 'input' ? 'input' : 'output'}
                  slotIndex={wire.toSlot}
                  component={wire.conditioner || null}
                  isRequired={isReq}
                  requiredName={comp?.requiredConditionerName || 'Direct (0Ω) / Resistor'}
                  draggedCategory={draggedCategory}
                  onDropConditioner={(_, __, conditionerComp) => {
                    if (onAttachWireConditioner) {
                      onAttachWireConditioner(wire.id, conditionerComp);
                    }
                  }}
                  onRemoveConditioner={() => {
                    if (onRemoveWireConditioner) {
                      onRemoveWireConditioner(wire.id);
                    }
                  }}
                  onInvalidDropAttempt={onInvalidDropAttempt}
                />

                {/* Wire Disconnect Button on Hover */}
                {onDisconnectWire && (
                  <button
                    onClick={() => onDisconnectWire(wire.id)}
                    className="opacity-0 group-hover/wire:opacity-100 p-0.5 bg-red-600 text-white rounded-full text-[8px] hover:scale-115 transition-all shadow-xs cursor-pointer"
                    title="Disconnect wire"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          {/* 1. INPUT LAYER (3 Slots) */}
          <div className="w-full flex flex-col items-center z-10">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                Input
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
                  onStartWire={handleStartWire}
                />
              ))}
            </div>
          </div>

          {/* 2. DEVICE / BOARD LAYER (3 Slots) */}
          <div className="w-full flex flex-col items-center z-10">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                Device
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
                onStartWire={handleStartWire}
                onCompleteWire={handleCompleteWire}
                isWireTargetCandidate={Boolean(drawingWire && drawingWire.fromCategory === 'input')}
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
                onStartWire={handleStartWire}
                onCompleteWire={handleCompleteWire}
                isWireTargetCandidate={Boolean(drawingWire && drawingWire.fromCategory === 'input')}
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
                onStartWire={handleStartWire}
                onCompleteWire={handleCompleteWire}
                isWireTargetCandidate={Boolean(drawingWire && drawingWire.fromCategory === 'input')}
              />
            </div>
          </div>

          {/* 3. OUTPUT LAYER (3 Slots) */}
          <div className="w-full flex flex-col items-center z-10">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                Output
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
                  onCompleteWire={handleCompleteWire}
                  isWireTargetCandidate={Boolean(drawingWire && drawingWire.fromCategory === 'board')}
                  isWireTargetInvalid={Boolean(drawingWire && drawingWire.fromCategory === 'input')}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
