import React from 'react';
import { useKos } from '../context/KosContext';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmationModal: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useKos();

  if (!confirmDialog.isOpen) return null;

  return (
    <div
      id="confirm-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="confirm-modal-box"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            id="close-confirm-modal"
            onClick={closeConfirmDialog}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 id="confirm-modal-title" className="text-lg font-bold text-slate-900 mb-1">
          {confirmDialog.title || 'Konfirmasi Hapus Data'}
        </h3>
        <p id="confirm-modal-desc" className="text-sm text-slate-600 mb-6 leading-relaxed">
          {confirmDialog.message || 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.'}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            id="btn-cancel-confirm"
            type="button"
            onClick={closeConfirmDialog}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            id="btn-execute-confirm"
            type="button"
            onClick={confirmDialog.onConfirm}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-sm transition-all"
          >
            Ya, Hapus Data
          </button>
        </div>
      </div>
    </div>
  );
};
