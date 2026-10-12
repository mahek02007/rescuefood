import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5EAE7] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#F8F8F2]">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isDestructive ? 'bg-red-50 text-red-600' : 'bg-[#EBF5ED] text-[#245C45]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-[#25312B]">{title}</h4>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E9F96] hover:text-[#25312B] p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="py-4 text-sm text-[#53645B] leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F8F8F2]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E5EAE7] text-sm font-semibold text-[#53645B] hover:bg-[#F8F8F2] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-xs ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 active:scale-95'
                : 'bg-[#245C45] hover:bg-[#1B4534] active:scale-95'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
