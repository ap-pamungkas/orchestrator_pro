import React, { useState, useEffect } from 'react';
import { XIcon, Edit3Icon, FileCodeIcon } from '../icons/Icons';

interface RenameFileModalProps {
  isOpen: boolean;
  currentFileName: string;
  existingFileNames: string[];
  onClose: () => void;
  onRenameFile: (oldName: string, newName: string) => void;
}

export const RenameFileModal: React.FC<RenameFileModalProps> = ({
  isOpen,
  currentFileName,
  existingFileNames,
  onClose,
  onRenameFile,
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewFileName(currentFileName);
      setError(null);
    }
  }, [isOpen, currentFileName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let cleanName = newFileName.trim();
    if (!cleanName) {
      setError('File name cannot be empty.');
      return;
    }

    // Auto-append original extension if none provided
    if (!cleanName.includes('.')) {
      const origExt = currentFileName.includes('.')
        ? `.${currentFileName.split('.').pop()}`
        : '.h';
      cleanName = `${cleanName}${origExt}`;
    }

    cleanName = cleanName.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (
      cleanName.toLowerCase() !== currentFileName.toLowerCase() &&
      existingFileNames.some((f) => f.toLowerCase() === cleanName.toLowerCase())
    ) {
      setError(`A file named "${cleanName}" already exists.`);
      return;
    }

    onRenameFile(currentFileName, cleanName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Edit3Icon className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-bold text-xs text-zinc-900 leading-tight">
              Rename File
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] font-medium flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              File Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-2.5 text-zinc-400 pointer-events-none">
                <FileCodeIcon className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                required
                autoFocus
                value={newFileName}
                onChange={(e) => {
                  setNewFileName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. pins.h"
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-300 rounded-lg font-mono text-xs text-zinc-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
