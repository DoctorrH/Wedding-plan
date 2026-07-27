import React, { useState } from 'react';
import { X, Check, FolderPlus, Sparkles } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
}

const SAMPLE_CATEGORIES = [
  'Lễ Nhà Chùa & Cầu An',
  'Bia Rượu & Nước Ngọt',
  'MC & Ban Nhạc / Vũ Đoàn',
  'Trăng Mật & Vé Máy Bay',
  'Quà Cảm Ơn Khách Mời',
  'Dịch Vụ Xe Đưa Đón Họ Hàng',
  'An Ninh & Bảo Vệ Tiệc Cưới',
  'Thủ Tục Đăng Ký Kết Hôn',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCategory(name.trim());
    setName('');
    onClose();
  };

  const handleSelectSample = (sample: string) => {
    setName(sample);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FCFAF7] max-w-md w-full border border-[#D4C3B5] animate-in fade-in zoom-in-95 duration-150 shadow-xl">
        <div className="bg-white p-5 border-b border-[#EBE3DC] flex items-center justify-between">
          <h3 className="font-serif italic text-2xl text-[#2D2926] flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#2D2926]" />
            <span>Thêm Danh Mục Công Việc Mới</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#EBE3DC] text-[#2D2926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1.5">
              Tên Danh Mục Mới <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Bia Rượu & Nước Ngọt, Trăng Mật..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          {/* Sample Suggestions */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926]/70 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Gợi ý danh mục phổ biến:</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {SAMPLE_CATEGORIES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-[#EBE3DC] hover:border-[#2D2926] hover:bg-[#F5F1EE] text-[#2D2926] transition-colors text-left"
                >
                  + {sample}
                </button>
              ))}
            </div>
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
              <span>Thêm Danh Mục</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
