import React, { useState, useEffect } from 'react';
import { X, Check, FolderEdit } from 'lucide-react';
import { TaskCategory, CATEGORY_LABELS } from '../types';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryKey: TaskCategory | null;
  currentName: string;
  onSave: (categoryKey: TaskCategory, newName: string) => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  categoryKey,
  currentName,
  onSave,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(currentName);
  }, [currentName, isOpen]);

  if (!isOpen || !categoryKey) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(categoryKey, name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FCFAF7] max-w-md w-full border border-[#D4C3B5] animate-in fade-in zoom-in-95 duration-150 shadow-xl">
        <div className="bg-white p-5 border-b border-[#EBE3DC] flex items-center justify-between">
          <h3 className="font-serif italic text-2xl text-[#2D2926] flex items-center gap-2">
            <FolderEdit className="w-5 h-5 text-[#2D2926]" />
            <span>Chỉnh Sửa Tên Danh Mục</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#EBE3DC] text-[#2D2926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Tên Danh Mục Gốc
            </label>
            <div className="text-xs text-[#2D2926]/60 font-mono bg-[#EBE3DC]/40 p-2 border border-[#EBE3DC]">
              {CATEGORY_LABELS[categoryKey]?.label || categoryKey}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Tên Danh Mục Mới <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục tùy chỉnh..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          <div className="pt-4 border-t border-[#EBE3DC] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#2D2926] hover:bg-[#EBE3DC] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2D2926] text-[#FCFAF7] text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 hover:bg-black"
            >
              <Check className="w-4 h-4" />
              <span>Lưu tên mới</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
