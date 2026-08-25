import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/common/Toast';

const TestComponent = () => {
  const toast = useToast();

  return (
    <div>
      <button
        onClick={() => toast.success('Berhasil Disimpan', 'Data berhasil masuk database.')}
      >
        Trigger Success
      </button>
      <button
        onClick={() => toast.error('Gagal Menyimpan', 'Terjadi error di database.')}
      >
        Trigger Error
      </button>
      <button
        onClick={() => toast.loading('Sedang Menyimpan...', 'Proses simpan.')}
      >
        Trigger Loading
      </button>
    </div>
  );
};

describe('Toast Notification System', () => {
  it('renders success toast notification properly', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successBtn = screen.getByText('Trigger Success');
    act(() => {
      fireEvent.click(successBtn);
    });

    expect(screen.getByText('DATABASE SYNC SUCCESS')).toBeInTheDocument();
    expect(screen.getByText('Berhasil Disimpan')).toBeInTheDocument();
    expect(screen.getByText('Data berhasil masuk database.')).toBeInTheDocument();
  });

  it('renders error toast notification properly', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const errorBtn = screen.getByText('Trigger Error');
    act(() => {
      fireEvent.click(errorBtn);
    });

    expect(screen.getByText('DATABASE ERROR')).toBeInTheDocument();
    expect(screen.getByText('Gagal Menyimpan')).toBeInTheDocument();
    expect(screen.getByText('Terjadi error di database.')).toBeInTheDocument();
  });

  it('dismisses toast when close button is clicked', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successBtn = screen.getByText('Trigger Success');
    act(() => {
      fireEvent.click(successBtn);
    });

    expect(screen.getByText('Berhasil Disimpan')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Tutup notifikasi');
    act(() => {
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByText('Berhasil Disimpan')).not.toBeInTheDocument();
  });
});
