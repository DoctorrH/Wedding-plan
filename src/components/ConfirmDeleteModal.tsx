import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác Nhận Xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này khỏi cơ sở dữ liệu? Hành động này không thể hoàn tác.',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FCFAF7] max-w-md w-full border border-[#D4C3B5] animate-in fade-in zoom-in-95 duration-150 shadow-xl overflow-hidden">
        <div className="bg-white p-5 border-b border-[#EBE3DC] flex items-center justify-between">
          <h3 className="font-serif italic text-2xl text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-700" />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#EBE3DC] text-[#2D2926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-[#2D2926]/80 leading-relaxed">
            {message}
          </p>

          <div className="pt-4 border-t border-[#EBE3DC] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#2D2926] hover:bg-[#EBE3DC] transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Đồng ý xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
