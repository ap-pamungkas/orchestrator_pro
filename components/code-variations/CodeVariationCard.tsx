import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { KitComponent, CodeVariation, ArchitectureState, CodeFile } from '@/types';
import { highlightCppCode } from './highlightCpp';
import { StatusLedGroup } from '../common/StatusLedGroup';
import { AddFileModal } from './AddFileModal';
import { RenameFileModal } from './RenameFileModal';
import { AddCaseModal } from './AddCaseModal';
import { EditCaseModal } from './EditCaseModal';
import {
  CodeIcon,
  FileCodeIcon,
  CheckIcon,
  AlertTriangleIcon,
  LayersIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  SaveIcon,
  CopyIcon,
  DownloadIcon,
  UndoIcon,
  MaximizeIcon,
  MinimizeIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
  Edit3Icon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  FilePlusIcon,
} from '../icons/Icons';

interface CodeVariationCardProps {
  architecture: ArchitectureState;
  selectedComponent: KitComponent | null;
  selectedVariation: CodeVariation | null;
  allVariations: CodeVariation[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelectVariation: (variation: CodeVariation) => void;
  onAddCustomCase: (newCase: CodeVariation) => void;
  onUpdateCase: (updatedCase: CodeVariation) => void;
  onDeleteCustomCase: (caseId: string) => void;
}

export const CodeVariationCard: React.FC<CodeVariationCardProps> = ({
  architecture,
  selectedComponent: _selectedComponent,
  selectedVariation,
  allVariations,
  isExpanded = false,
  onToggleExpand,
  onSelectVariation,
  onAddCustomCase,
  onUpdateCase,
  onDeleteCustomCase,
}) => {
  const [isVariationsOpen, setIsVariationsOpen] = useState<boolean>(true);

  // Modals state
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [targetCaseForNewFile, setTargetCaseForNewFile] = useState<CodeVariation | null>(null);

  const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<string>('main.cpp');
  const [targetCaseForRenameFile, setTargetCaseForRenameFile] = useState<CodeVariation | null>(null);

  const [isAddCaseModalOpen, setIsAddCaseModalOpen] = useState(false);
  const [isEditCaseModalOpen, setIsEditCaseModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<CodeVariation | null>(null);

  // Multi-File Project State per Variation ID: Record<variationId, CodeFile[]>
  const [filesByVariation, setFilesByVariation] = useState<Record<string, CodeFile[]>>({});
  const [activeFileName, setActiveFileName] = useState<string>('main.cpp');

  // Track folder expansion states in explorer: Record<variationId, boolean>
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Track per-file unsaved / draft status
  const [unsavedFiles, setUnsavedFiles] = useState<Record<string, boolean>>({});

  const [currentCode, setCurrentCode] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'just_saved'>('saved');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const hasInput = architecture.inputs.some(Boolean);
  const hasBoard = architecture.boards.some(Boolean);
  const hasOutput = architecture.outputs.some(Boolean);
  const isArchitectureComplete = hasInput && hasBoard && hasOutput;

  // Active primary input component in the pipeline
  const primaryInput = architecture.inputs.find(Boolean);
  const activeInputId = primaryInput?.id;

  // Strict Pipeline-Aware Filtering:
  // Show ONLY cases that belong to the active input component in the pipeline.
  // If the active input (e.g. DHT22) has no cases yet, availableVariations will be empty [].
  const availableVariations = useMemo(() => {
    if (!activeInputId) return [];
    return allVariations.filter((v) => v.componentId === activeInputId);
  }, [allVariations, activeInputId]);

  const currentVariation = useMemo(() => {
    if (availableVariations.length === 0) return null;
    if (selectedVariation && availableVariations.some((v) => v.id === selectedVariation.id)) {
      return selectedVariation;
    }
    return availableVariations[0] || null;
  }, [availableVariations, selectedVariation]);

  // Helper to resolve current file list for a specific variation
  const getVariationFiles = useCallback(
    (variation: CodeVariation | null): CodeFile[] => {
      if (!variation) return [{ name: 'main.cpp', content: '' }];
      if (filesByVariation[variation.id] && filesByVariation[variation.id].length > 0) {
        return filesByVariation[variation.id];
      }
      if (variation.files && variation.files.length > 0) {
        return variation.files;
      }
      return [
        {
          name: 'main.cpp',
          content: variation.sourceCode,
        },
      ];
    },
    [filesByVariation]
  );

  const currentFiles: CodeFile[] = useMemo(() => {
    return getVariationFiles(currentVariation);
  }, [currentVariation, getVariationFiles]);

  // Keep active folder expanded by default
  useEffect(() => {
    if (currentVariation) {
      setExpandedFolders((prev) => ({
        ...prev,
        [currentVariation.id]: prev[currentVariation.id] !== false,
      }));
    }
  }, [currentVariation]);

  // Synchronize when switching to a different variation
  const currentVariationIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentVariation) {
      if (currentVariation.id !== currentVariationIdRef.current) {
        currentVariationIdRef.current = currentVariation.id;
        const initialFiles = getVariationFiles(currentVariation);
        const firstFile = initialFiles[0] || { name: 'main.cpp', content: currentVariation.sourceCode };

        setActiveFileName(firstFile.name);
        setCurrentCode(firstFile.content);
        setSaveStatus('saved');
      }
    } else {
      currentVariationIdRef.current = null;
      setCurrentCode('');
      setActiveFileName('main.cpp');
    }
  }, [currentVariation, getVariationFiles]);

  // Toggle Folder Expand/Collapse
  const toggleFolder = (variationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [variationId]: prev[variationId] === false ? true : false,
    }));
  };

  // Generate Syntax Highlighted HTML
  const highlightedHtml = useMemo(() => {
    return highlightCppCode(currentCode);
  }, [currentCode]);

  // Update in-memory file content buffer on code change
  const handleCodeChange = useCallback((newCode: string) => {
    setCurrentCode(newCode);
    setSaveStatus('unsaved');
    setUnsavedFiles((prev) => ({ ...prev, [activeFileName]: true }));

    if (currentVariation) {
      setFilesByVariation((prev) => {
        const existingList = prev[currentVariation.id] || currentFiles;
        const updatedList = existingList.map((f) =>
          f.name === activeFileName ? { ...f, content: newCode } : f
        );
        return {
          ...prev,
          [currentVariation.id]: updatedList,
        };
      });
    }
  }, [activeFileName, currentVariation, currentFiles]);

  // Switch Active File Tab
  const handleSelectTab = (fileName: string) => {
    if (fileName === activeFileName) return;

    // Save current file buffer in local state first
    if (currentVariation) {
      setFilesByVariation((prev) => {
        const existingList = prev[currentVariation.id] || currentFiles;
        const updatedList = existingList.map((f) =>
          f.name === activeFileName ? { ...f, content: currentCode } : f
        );
        return {
          ...prev,
          [currentVariation.id]: updatedList,
        };
      });
    }

    const targetFile = currentFiles.find((f) => f.name === fileName);
    if (targetFile) {
      setActiveFileName(fileName);
      setCurrentCode(targetFile.content);
      setSaveStatus(unsavedFiles[fileName] ? 'unsaved' : 'saved');
    }
  };

  // Open a file from any folder in the Explorer
  const handleOpenFileFromExplorer = (variation: CodeVariation, file: CodeFile) => {
    if (currentVariation?.id !== variation.id) {
      onSelectVariation(variation);
    }
    setActiveFileName(file.name);
    setCurrentCode(file.content);
    setSaveStatus(unsavedFiles[file.name] ? 'unsaved' : 'saved');
  };

  // Add a new file to a specific case folder
  const handleAddNewFile = (newFileName: string, initialContent: string = '') => {
    const targetCase = targetCaseForNewFile || currentVariation;
    if (!targetCase) return;

    const newFile: CodeFile = {
      name: newFileName,
      content: initialContent,
    };

    const existingList = getVariationFiles(targetCase);
    const updatedList = existingList.some((f) => f.name.toLowerCase() === newFileName.toLowerCase())
      ? existingList.map((f) => (f.name.toLowerCase() === newFileName.toLowerCase() ? newFile : f))
      : [...existingList, newFile];

    setFilesByVariation((prev) => ({
      ...prev,
      [targetCase.id]: updatedList,
    }));

    // If active case, switch tab to new file
    if (currentVariation?.id === targetCase.id) {
      setActiveFileName(newFileName);
      setCurrentCode(initialContent);
    }

    setUnsavedFiles((prev) => ({ ...prev, [newFileName]: false }));
    setSaveStatus('just_saved');
    setTimeout(() => setSaveStatus('saved'), 2000);

    // Make sure folder is expanded
    setExpandedFolders((prev) => ({ ...prev, [targetCase.id]: true }));

    // Immediately commit the new file into the Case
    onUpdateCase({
      ...targetCase,
      files: updatedList,
      sourceCode: updatedList.find((f) => f.name === 'main.cpp')?.content || targetCase.sourceCode,
    });
  };

  // Rename a file in a specific case folder
  const handleRenameFile = (oldName: string, newName: string) => {
    const targetCase = targetCaseForRenameFile || currentVariation;
    if (!targetCase || oldName === newName) return;

    const existingList = getVariationFiles(targetCase);
    const updatedList = existingList.map((f) =>
      f.name === oldName ? { ...f, name: newName } : f
    );

    setFilesByVariation((prev) => ({
      ...prev,
      [targetCase.id]: updatedList,
    }));

    // Transfer unsaved state if any
    setUnsavedFiles((prev) => {
      const copy = { ...prev };
      if (copy[oldName]) {
        copy[newName] = copy[oldName];
        delete copy[oldName];
      }
      return copy;
    });

    if (currentVariation?.id === targetCase.id && activeFileName === oldName) {
      setActiveFileName(newName);
    }

    setSaveStatus('just_saved');
    setTimeout(() => setSaveStatus('saved'), 2000);

    // Persist immediately to the Case in app state and localStorage
    onUpdateCase({
      ...targetCase,
      files: updatedList,
      sourceCode: updatedList.find((f) => f.name === 'main.cpp' || f.name === newName)?.content || targetCase.sourceCode,
    });
  };

  // Open Add File Modal for a specific case folder
  const handleOpenAddFileForCase = (variation: CodeVariation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetCaseForNewFile(variation);
    setIsAddFileModalOpen(true);
  };

  // Open Rename Modal for specific file in a case folder
  const handleOpenRenameModal = (variation: CodeVariation, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetCaseForRenameFile(variation);
    setFileToRename(fileName);
    setIsRenameFileModalOpen(true);
  };

  // Delete a file from a specific case folder
  const handleDeleteFileFromCase = (variation: CodeVariation, fileNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingList = getVariationFiles(variation);
    if (existingList.length <= 1) return; // Keep at least one file

    const updatedList = existingList.filter((f) => f.name !== fileNameToDelete);

    setFilesByVariation((prev) => ({
      ...prev,
      [variation.id]: updatedList,
    }));

    setUnsavedFiles((prev) => {
      const copy = { ...prev };
      delete copy[fileNameToDelete];
      return copy;
    });

    if (currentVariation?.id === variation.id && activeFileName === fileNameToDelete) {
      const nextFile = updatedList[0];
      setActiveFileName(nextFile.name);
      setCurrentCode(nextFile.content);
      setSaveStatus(unsavedFiles[nextFile.name] ? 'unsaved' : 'saved');
    }

    // Persist deletion directly to the Case
    onUpdateCase({
      ...variation,
      files: updatedList,
      sourceCode: updatedList.find((f) => f.name === 'main.cpp')?.content || variation.sourceCode,
    });
  };

  // Open Edit Case Modal
  const handleOpenEditCase = (variation: CodeVariation, e: React.MouseEvent) => {
    e.stopPropagation();
    setCaseToEdit(variation);
    setIsEditCaseModalOpen(true);
  };

  // Save current active file & automatically commit all files into the active Case
  const handleSave = useCallback(() => {
    if (!currentVariation) return;

    const existingList = filesByVariation[currentVariation.id] || currentFiles;
    const updatedList = existingList.map((f) =>
      f.name === activeFileName ? { ...f, content: currentCode } : f
    );

    // Update in-memory state
    setFilesByVariation((prev) => ({
      ...prev,
      [currentVariation.id]: updatedList,
    }));

    // Clear unsaved status for this file
    setUnsavedFiles((prev) => ({
      ...prev,
      [activeFileName]: false,
    }));

    // Commit and save all files permanently into this Case in app state & localStorage
    const mainCppFile = updatedList.find((f) => f.name === 'main.cpp');
    const updatedCase: CodeVariation = {
      ...currentVariation,
      files: updatedList,
      sourceCode: mainCppFile ? mainCppFile.content : currentCode,
    };
    onUpdateCase(updatedCase);

    setSaveStatus('just_saved');
    setTimeout(() => {
      setSaveStatus('saved');
    }, 2000);
  }, [currentVariation, currentFiles, activeFileName, currentCode, onUpdateCase, filesByVariation]);

  // Revert active file to default template
  const handleRevert = useCallback(() => {
    if (!currentVariation) return;
    if (activeFileName === 'main.cpp') {
      setCurrentCode(currentVariation.sourceCode);
      handleCodeChange(currentVariation.sourceCode);
    }
    setSaveStatus('saved');
    setUnsavedFiles((prev) => ({ ...prev, [activeFileName]: false }));
  }, [currentVariation, activeFileName, handleCodeChange]);

  // Copy code to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentCode);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  }, [currentCode]);

  // Download active file or sketch bundle
  const handleDownload = useCallback(() => {
    if (!currentVariation) return;
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // If main.cpp, download as .ino for Arduino IDE compatibility
    const extName = activeFileName === 'main.cpp' ? `${currentVariation.id}_sketch.ino` : activeFileName;
    link.download = extName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [currentCode, currentVariation, activeFileName]);

  // Tab key & Keyboard Shortcuts (Ctrl+S / Cmd+S)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      handleCodeChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Sync scroll between textarea, pre highlighter, and line numbers
  const handleScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
      }
    }
  };

  const lineCount = (currentCode.match(/\n/g) || []).length + 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const isCurrentFileUnsaved = Boolean(unsavedFiles[activeFileName] || saveStatus === 'unsaved');

  return (
    <>
      <div
        className={`${isExpanded
          ? 'w-full flex-1 h-full max-w-full'
          : 'w-[620px] md:w-[700px] lg:w-[800px] xl:w-[880px] flex-1 max-w-[960px] flex-shrink-0'
          } flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden select-none transition-all duration-300`}
      >
        {/* Card Header */}
        <div className="p-3 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CodeIcon className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-[11px] tracking-wider text-zinc-800 uppercase">
              Code Editor
            </h2>
            <StatusLedGroup />
          </div>

          {/* Right Side Header Controls */}
          <div className="flex items-center gap-2">
            {isArchitectureComplete && (
              <>
                <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 font-semibold">
                  {primaryInput?.name || 'Input'} ➔ ESP32 ➔ {architecture.outputs.find(Boolean)?.name || 'Output'}
                </span>

                {/* Explorer Drawer Toggle Button */}
                <button
                  onClick={() => setIsVariationsOpen(!isVariationsOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white hover:bg-zinc-100 text-[10px] font-medium text-zinc-700 border border-zinc-200 transition-colors cursor-pointer shadow-2xs"
                  title={isVariationsOpen ? 'Collapse Explorer' : 'Expand Project Explorer'}
                >
                  <LayersIcon className="w-3 h-3 text-blue-600" />
                  <span>{isVariationsOpen ? 'Hide Explorer' : `Explorer (${availableVariations.length} Cases)`}</span>
                  {isVariationsOpen ? (
                    <ChevronRightIcon className="w-3 h-3 text-zinc-400" />
                  ) : (
                    <ChevronDownIcon className="w-3 h-3 text-zinc-400" />
                  )}
                </button>
              </>
            )}

            {/* Expand / Restore Button */}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-zinc-100 text-[10px] font-medium text-zinc-600 border border-zinc-200 transition-colors cursor-pointer shadow-2xs"
                title={isExpanded ? 'Restore card size' : 'Expand Code Editor to full canvas'}
              >
                {isExpanded ? (
                  <>
                    <MinimizeIcon className="w-3 h-3" />

                  </>
                ) : (
                  <>
                    <MaximizeIcon className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Card Body */}
        {!isArchitectureComplete ? (
          /* INCOMPLETE ARCHITECTURE STATE */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400 min-h-[420px] bg-zinc-50/40">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-xs text-zinc-800 mb-1">
              Architecture Pipeline Incomplete
            </h3>
            <p className="text-[11px] text-zinc-500 max-w-[280px] leading-relaxed mb-4">
              Place components across all 3 layers (<strong className="text-zinc-700">Input ➔ Device ➔ Output</strong>) to unlock the code editor.
            </p>

            {/* Progress Checklist */}
            <div className="w-full max-w-[260px] bg-white rounded-xl border border-zinc-200 p-3 space-y-2 text-left shadow-2xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-600">1. Input Layer</span>
                {hasInput ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                    <CheckIcon className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="text-zinc-400 font-mono text-[10px]">Waiting...</span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-600">2. Device Layer</span>
                {hasBoard ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                    <CheckIcon className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="text-zinc-400 font-mono text-[10px]">Waiting...</span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-zinc-600">3. Output Layer</span>
                {hasOutput ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                    <CheckIcon className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="text-zinc-400 font-mono text-[10px]">Waiting...</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ARCHITECTURE COMPLETE */
          <div className="flex-1 flex flex-col min-h-[420px]">
            {/* If there are NO variations for this input sensor yet */}
            {availableVariations.length === 0 || !currentVariation ? (
              <div className="flex-1 flex overflow-hidden">
                {/* Left empty prompt */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400 bg-zinc-50/40">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
                    <CodeIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xs text-zinc-800 mb-1">
                    Belum Ada Case Kode untuk {primaryInput?.name || 'Hardware Pipeline'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 max-w-[320px] leading-relaxed mb-4 font-sans">
                    Komponen <strong className="text-zinc-700">{primaryInput?.name}</strong> belum memiliki template kode bawaan. Buat case pertama Anda untuk generate starter code C++.
                  </p>
                  <button
                    onClick={() => setIsAddCaseModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <FolderPlusIcon className="w-4 h-4" />
                    <span>+ Buat Case untuk {primaryInput?.name}</span>
                  </button>
                </div>

                {/* Right empty explorer */}
                {isVariationsOpen && (
                  <div className="w-[260px] lg:w-[300px] bg-zinc-50/80 border-l border-zinc-200/80 flex flex-col overflow-hidden">
                    <div className="px-3 py-2 border-b border-zinc-200/80 bg-zinc-100/70 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-zinc-700 uppercase tracking-wider">
                        <FolderOpenIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>CASE EXPLORER (0)</span>
                      </div>
                      <button
                        onClick={() => setIsAddCaseModalOpen(true)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        <FolderPlusIcon className="w-3 h-3" />
                        <span>+ Case</span>
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-zinc-400 my-auto">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-2">
                        <FolderIcon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-xs text-zinc-700 mb-1">
                        Belum ada Case
                      </span>
                      <p className="text-[10.5px] text-zinc-500 max-w-[200px] leading-snug mb-3 font-sans">
                        Pipeline {primaryInput?.name} belum memiliki skenario kode.
                      </p>
                      <button
                        onClick={() => setIsAddCaseModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <FolderPlusIcon className="w-3.5 h-3.5" />
                        <span>+ Buat Case Baru</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ACTIVE VARIATIONS & CODE EDITOR */
              <>
                {/* File Tab Bar & Action Toolbar */}
                <div className="px-2.5 py-1 bg-zinc-50/90 border-b border-zinc-200 flex items-center justify-between text-xs overflow-x-auto custom-scrollbar">
                  {/* File Tabs List */}
                  <div className="flex items-center gap-1 min-w-0">
                    {currentFiles.map((file) => {
                      const isActive = file.name === activeFileName;
                      const isFileUnsaved = Boolean(unsavedFiles[file.name]);

                      return (
                        <div
                          key={file.name}
                          onClick={() => handleSelectTab(file.name)}
                          onDoubleClick={(e) => currentVariation && handleOpenRenameModal(currentVariation, file.name, e)}
                          title={`Click to switch, double-click to rename`}
                          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] transition-all cursor-pointer select-none ${isActive
                            ? 'bg-white border border-zinc-200 text-blue-700 font-semibold shadow-2xs'
                            : 'bg-zinc-100/70 hover:bg-zinc-200/70 text-zinc-600 border border-transparent'
                            }`}
                        >
                          <FileCodeIcon
                            className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`}
                          />
                          <span>{file.name}</span>

                          {/* Unsaved Draft Indicator Dot on Tab */}
                          {isFileUnsaved && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                              title="File belum disimpan ke Case (Unsaved Draft)"
                            />
                          )}

                          {/* Rename Icon button */}
                          <button
                            onClick={(e) => currentVariation && handleOpenRenameModal(currentVariation, file.name, e)}
                            title={`Rename ${file.name}`}
                            className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-zinc-400 hover:text-blue-600 p-0.5 rounded transition-all cursor-pointer"
                          >
                            <Edit3Icon className="w-2.5 h-2.5" />
                          </button>

                          {/* Close / Delete custom file button */}
                          {currentFiles.length > 1 && (
                            <button
                              onClick={(e) => currentVariation && handleDeleteFileFromCase(currentVariation, file.name, e)}
                              title={`Delete ${file.name} from this Case`}
                              className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-zinc-400 hover:text-red-600 ml-0.5 p-0.5 rounded transition-all cursor-pointer"
                            >
                              <XIcon className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Add New File Tab Button */}
                    <button
                      onClick={() => currentVariation && handleOpenAddFileForCase(currentVariation)}
                      title="Add new file to current case folder"
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-dashed border-zinc-300 hover:border-blue-300 font-mono text-[10.5px] transition-colors cursor-pointer"
                    >
                      <FilePlusIcon className="w-3 h-3" />
                      <span>File</span>
                    </button>

                    {/* Save to Case Status Indicator */}
                    <div className="ml-2 pl-2 border-l border-zinc-200 hidden sm:block">
                      {saveStatus === 'just_saved' ? (
                        <span className="flex items-center gap-1 text-[9.5px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold animate-in fade-in">
                          <CheckIcon className="w-2.5 h-2.5 text-emerald-600" /> Tersimpan ke Case!
                        </span>
                      ) : isCurrentFileUnsaved ? (
                        <span className="flex items-center gap-1 text-[9.5px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Belum Disimpan ke Case
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-mono text-zinc-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tersimpan di Case
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Editor Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {/* Save Button */}
                    <button
                      onClick={handleSave}
                      title="Simpan file ke Case ini (Ctrl+S)"
                      className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium text-[10px] transition-all cursor-pointer shadow-2xs active:scale-95 ${isCurrentFileUnsaved
                        ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-300 animate-pulse'
                        : 'bg-zinc-800 hover:bg-zinc-900 text-white'
                        }`}
                    >
                      <SaveIcon className="w-3 h-3" />
                      <span>Simpan</span>
                    </button>

                    {/* Revert Button */}
                    <button
                      onClick={handleRevert}
                      title="Revert to original template"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] transition-colors cursor-pointer shadow-2xs"
                    >
                      <UndoIcon className="w-3 h-3" />
                      <span>Reset</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={handleCopy}
                      title="Copy code to clipboard"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] transition-colors cursor-pointer shadow-2xs"
                    >
                      {copyFeedback ? <CheckIcon className="w-3 h-3 text-emerald-600" /> : <CopyIcon className="w-3 h-3" />}
                      <span>{copyFeedback ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      title="Download active file"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200 text-[10px] transition-colors cursor-pointer shadow-2xs"
                    >
                      <DownloadIcon className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Dual Split Content: Code Editor on Left, Folder Case Explorer on Right */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left: Interactive Syntax-Highlighted Editor */}
                  <div className="flex-1 flex bg-[#181825] text-zinc-100 overflow-hidden relative font-mono text-[11.5px] border-r border-zinc-800">
                    {/* Line Numbers Column */}
                    <div
                      ref={lineNumbersRef}
                      className="w-10 py-3 pr-2 select-none text-right text-zinc-600 font-mono text-[11.5px] bg-[#11111b] border-r border-zinc-800/80 overflow-hidden"
                    >
                      {lineNumbers.map((num) => (
                        <div key={num} className="leading-6">
                          {num}
                        </div>
                      ))}
                    </div>

                    {/* Dual-Layer Code Editor Area */}
                    <div className="flex-1 relative overflow-hidden bg-[#181825]">
                      {/* Background Syntax Highlighted View */}
                      <pre
                        ref={preRef}
                        aria-hidden="true"
                        className="w-full h-full p-3 pl-3 m-0 bg-transparent font-mono text-[11.5px] leading-6 overflow-hidden pointer-events-none whitespace-pre select-none"
                        dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
                      />

                      {/* Foreground Transparent Textarea for User Input */}
                      <textarea
                        ref={textareaRef}
                        value={currentCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onScroll={handleScroll}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoComplete="off"
                        className="absolute inset-0 w-full h-full p-3 pl-3 bg-transparent text-transparent caret-blue-400 font-mono text-[11.5px] leading-6 resize-none outline-none border-none custom-scrollbar whitespace-pre selection:bg-blue-500/30 selection:text-transparent"
                        placeholder="// Enter C++ code here..."
                      />
                    </div>
                  </div>

                  {/* Right: IDE Project Explorer (Folders = Cases, Files = Case Files) */}
                  {isVariationsOpen && (
                    <div className="w-[260px] lg:w-[300px] bg-zinc-50/80 border-l border-zinc-200/80 flex flex-col overflow-hidden animate-in slide-in-from-right-3 duration-200">
                      {/* Explorer Top Toolbar */}
                      <div className="px-3 py-2 border-b border-zinc-200/80 bg-zinc-100/70 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-zinc-700 uppercase tracking-wider">
                          <FolderOpenIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>CASE EXPLORER ({availableVariations.length})</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Add New Case Folder Button */}
                          <button
                            onClick={() => setIsAddCaseModalOpen(true)}
                            title={`Create new Case for ${primaryInput?.name || 'pipeline'}`}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors cursor-pointer shadow-2xs active:scale-95"
                          >
                            <FolderPlusIcon className="w-3 h-3" />
                            <span>+ Case</span>
                          </button>

                          <button
                            onClick={() => setIsVariationsOpen(false)}
                            className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-0.5 ml-1"
                            title="Close Explorer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Folder / Case Tree Scrollable Area */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar text-xs font-mono">
                        {availableVariations.map((variation, index) => {
                          const isSelectedCase = currentVariation?.id === variation.id;
                          const isExpandedFolder = expandedFolders[variation.id] !== false;
                          const caseFiles = getVariationFiles(variation);

                          return (
                            <div
                              key={variation.id}
                              className={`rounded-xl border transition-all overflow-hidden ${isSelectedCase
                                ? 'border-blue-300 bg-white shadow-xs'
                                : 'border-zinc-200 bg-white/70 hover:border-zinc-300'
                                }`}
                            >
                              {/* Case Folder Row Header */}
                              <div
                                onClick={() => {
                                  onSelectVariation(variation);
                                  setExpandedFolders((prev) => ({
                                    ...prev,
                                    [variation.id]: !isExpandedFolder,
                                  }));
                                }}
                                className={`group px-2.5 py-2 flex items-center justify-between cursor-pointer transition-colors ${isSelectedCase
                                  ? 'bg-blue-50/70 hover:bg-blue-50'
                                  : 'hover:bg-zinc-100/70'
                                  }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  {/* Chevron Arrow Toggle */}
                                  <button
                                    type="button"
                                    onClick={(e) => toggleFolder(variation.id, e)}
                                    className="p-0.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
                                  >
                                    {isExpandedFolder ? (
                                      <ChevronDownIcon className="w-3 h-3" />
                                    ) : (
                                      <ChevronRightIcon className="w-3 h-3" />
                                    )}
                                  </button>

                                  {/* Folder Icon */}
                                  {isExpandedFolder ? (
                                    <FolderOpenIcon
                                      className={`w-3.5 h-3.5 flex-shrink-0 ${isSelectedCase ? 'text-blue-600' : 'text-amber-500'
                                        }`}
                                    />
                                  ) : (
                                    <FolderIcon
                                      className={`w-3.5 h-3.5 flex-shrink-0 ${isSelectedCase ? 'text-blue-600' : 'text-amber-500'
                                        }`}
                                    />
                                  )}

                                  {/* Folder Name (Case Title) */}
                                  <span
                                    className={`font-semibold text-[11px] truncate leading-tight ${isSelectedCase ? 'text-blue-900 font-bold' : 'text-zinc-800'
                                      }`}
                                    title={variation.title}
                                  >
                                    {index + 1}. {variation.title}
                                  </span>
                                </div>

                                {/* Folder Right Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                  {/* Custom Badge or Difficulty Tag */}
                                  {variation.isCustom ? (
                                    <span className="text-[7.5px] px-1 py-0.2 rounded font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                      CUSTOM
                                    </span>
                                  ) : (
                                    <span
                                      className={`text-[7.5px] px-1 py-0.2 rounded font-medium border ${variation.difficulty === 'Beginner'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : variation.difficulty === 'Intermediate'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-purple-50 text-purple-700 border-purple-200'
                                        }`}
                                    >
                                      {variation.difficulty[0]}
                                    </span>
                                  )}

                                  {/* + Add File to this folder icon */}
                                  <button
                                    onClick={(e) => handleOpenAddFileForCase(variation, e)}
                                    title={`Add new file inside "${variation.title}" folder`}
                                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-zinc-400 hover:text-blue-600 rounded transition-all cursor-pointer"
                                  >
                                    <FilePlusIcon className="w-3 h-3" />
                                  </button>

                                  {/* Edit Case Folder icon */}
                                  <button
                                    onClick={(e) => handleOpenEditCase(variation, e)}
                                    title="Rename / Edit Case Folder"
                                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-zinc-400 hover:text-blue-600 rounded transition-all cursor-pointer"
                                  >
                                    <Edit3Icon className="w-3 h-3" />
                                  </button>

                                  {/* Delete Custom Case Folder icon */}
                                  {variation.isCustom && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteCustomCase(variation.id);
                                      }}
                                      title="Delete Case Folder"
                                      className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 text-zinc-400 hover:text-red-600 rounded transition-all cursor-pointer"
                                    >
                                      <Trash2Icon className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Nested Files inside this Case Folder */}
                              {isExpandedFolder && (
                                <div className="border-t border-zinc-100 bg-zinc-50/40 px-2 py-1.5 space-y-1">
                                  {caseFiles.map((file) => {
                                    const isThisFileActiveInEditor =
                                      isSelectedCase && activeFileName === file.name;
                                    const isFileUnsaved = Boolean(unsavedFiles[file.name]);

                                    return (
                                      <div
                                        key={file.name}
                                        onClick={() => handleOpenFileFromExplorer(variation, file)}
                                        className={`group/file flex items-center justify-between px-2 py-1 rounded-md text-[10.5px] transition-colors cursor-pointer ${isThisFileActiveInEditor
                                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                                          : 'hover:bg-zinc-200/60 text-zinc-700'
                                          }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1 pl-4 relative">
                                          {/* Tree branch line */}
                                          <div
                                            className={`absolute left-1.5 top-0 bottom-0 w-px ${isThisFileActiveInEditor ? 'bg-blue-400/50' : 'bg-zinc-300'
                                              }`}
                                          />
                                          <div
                                            className={`absolute left-1.5 top-1/2 w-2 h-px ${isThisFileActiveInEditor ? 'bg-blue-400/50' : 'bg-zinc-300'
                                              }`}
                                          />

                                          <FileCodeIcon
                                            className={`w-3.5 h-3.5 flex-shrink-0 ${isThisFileActiveInEditor ? 'text-white' : 'text-blue-600'
                                              }`}
                                          />
                                          <span className="truncate font-mono">{file.name}</span>

                                          {/* Unsaved indicator dot */}
                                          {isFileUnsaved && (
                                            <span
                                              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-1"
                                              title="Unsaved changes in this file"
                                            />
                                          )}
                                        </div>

                                        {/* File actions on hover */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                                          {/* Rename File */}
                                          <button
                                            onClick={(e) => handleOpenRenameModal(variation, file.name, e)}
                                            title={`Rename ${file.name}`}
                                            className={`p-0.5 rounded transition-colors ${isThisFileActiveInEditor
                                              ? 'text-blue-100 hover:text-white'
                                              : 'text-zinc-400 hover:text-blue-600'
                                              }`}
                                          >
                                            <Edit3Icon className="w-2.5 h-2.5" />
                                          </button>

                                          {/* Delete File (if more than 1 file in folder) */}
                                          {caseFiles.length > 1 && (
                                            <button
                                              onClick={(e) => handleDeleteFileFromCase(variation, file.name, e)}
                                              title={`Delete ${file.name} from folder`}
                                              className={`p-0.5 rounded transition-colors ${isThisFileActiveInEditor
                                                ? 'text-blue-100 hover:text-red-200'
                                                : 'text-zinc-400 hover:text-red-600'
                                                }`}
                                            >
                                              <Trash2Icon className="w-2.5 h-2.5" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Quick + Add File into this Case Folder Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenAddFileForCase(variation, e)}
                                    className="w-full mt-1 flex items-center justify-center gap-1 py-1 rounded border border-dashed border-zinc-300 hover:border-blue-400 hover:bg-blue-50/50 text-[10px] text-zinc-500 hover:text-blue-700 transition-colors cursor-pointer"
                                  >
                                    <PlusIcon className="w-2.5 h-2.5" />
                                    <span>Add file to this folder</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add File Modal Dialog */}
      <AddFileModal
        isOpen={isAddFileModalOpen}
        targetCaseTitle={targetCaseForNewFile?.title}
        existingFileNames={(targetCaseForNewFile ? getVariationFiles(targetCaseForNewFile) : currentFiles).map((f) => f.name)}
        onClose={() => {
          setIsAddFileModalOpen(false);
          setTargetCaseForNewFile(null);
        }}
        onAddFile={handleAddNewFile}
      />

      {/* Rename File Modal Dialog */}
      <RenameFileModal
        isOpen={isRenameFileModalOpen}
        currentFileName={fileToRename}
        existingFileNames={(targetCaseForRenameFile ? getVariationFiles(targetCaseForRenameFile) : currentFiles).map((f) => f.name)}
        onClose={() => {
          setIsRenameFileModalOpen(false);
          setTargetCaseForRenameFile(null);
        }}
        onRenameFile={handleRenameFile}
      />

      {/* Add Case Modal Dialog */}
      <AddCaseModal
        isOpen={isAddCaseModalOpen}
        activeComponentId={activeInputId || 'tactile-button'}
        architecture={architecture}
        currentVariation={currentVariation}
        onClose={() => setIsAddCaseModalOpen(false)}
        onAddCase={onAddCustomCase}
      />

      {/* Edit Case Modal Dialog */}
      <EditCaseModal
        isOpen={isEditCaseModalOpen}
        variation={caseToEdit}
        onClose={() => {
          setIsEditCaseModalOpen(false);
          setCaseToEdit(null);
        }}
        onUpdateCase={onUpdateCase}
      />
    </>
  );
};
