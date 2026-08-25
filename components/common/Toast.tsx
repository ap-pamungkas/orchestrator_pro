'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckIcon, AlertTriangleIcon, SparklesIcon, RefreshCwIcon, XIcon } from '../icons/Icons';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // Duration in ms (default: 4000ms, 0 for persistent)
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  loading: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, message?: string, duration = 4000) => {
      return showToast({ type: 'success', title, message, duration });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration = 6000) => {
      return showToast({ type: 'error', title, message, duration });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration = 4000) => {
      return showToast({ type: 'info', title, message, duration });
    },
    [showToast]
  );

  const loading = useCallback(
    (title: string, message?: string) => {
      return showToast({ type: 'loading', title, message, duration: 0 });
    },
    [showToast]
  );

  const contextValue = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      success,
      error,
      info,
      loading,
    }),
    [toasts, showToast, dismissToast, success, error, info, loading]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isLoading = toast.type === 'loading';
  const isInfo = toast.type === 'info';

  const badgeText = isSuccess
    ? 'DATABASE SYNC SUCCESS'
    : isError
    ? 'DATABASE ERROR'
    : isLoading
    ? 'SAVING TO DATABASE'
    : 'NOTIFICATION';

  const badgeColor = isSuccess
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    : isError
    ? 'bg-red-50 text-red-700 border-red-200/80'
    : isLoading
    ? 'bg-blue-50 text-blue-700 border-blue-200/80'
    : 'bg-zinc-100 text-zinc-700 border-zinc-200/80';

  const iconContainerColor = isSuccess
    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    : isError
    ? 'bg-red-500/10 text-red-600 border-red-500/20'
    : isLoading
    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    : 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20';

  const borderAccent = isSuccess
    ? 'border-l-4 border-l-emerald-500'
    : isError
    ? 'border-l-4 border-l-red-500'
    : isLoading
    ? 'border-l-4 border-l-blue-500'
    : 'border-l-4 border-l-zinc-400';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl border border-zinc-200 shadow-xl shadow-zinc-950/5 p-3.5 flex flex-col gap-2 transition-all duration-300 transform translate-y-0 opacity-100 ${borderAccent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${iconContainerColor}`}
          >
            {isSuccess && <CheckIcon className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
            {isError && <AlertTriangleIcon className="w-4 h-4 text-red-600 stroke-[2.5]" />}
            {isLoading && <RefreshCwIcon className="w-4 h-4 text-blue-600 animate-spin" />}
            {isInfo && <SparklesIcon className="w-4 h-4 text-zinc-600" />}
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[9.5px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded border ${badgeColor}`}>
                {badgeText}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-zinc-900 leading-snug break-words">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-[11px] text-zinc-600 leading-relaxed break-words">
                {toast.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
          className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-1 rounded-md transition-colors cursor-pointer flex-shrink-0"
        >
          <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
