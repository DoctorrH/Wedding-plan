import React, { useState, useEffect } from 'react';
import { X, Check, Heart, Calendar as CalendarIcon, MapPin, DollarSign } from 'lucide-react';
import { WeddingDetails } from '../types';

interface EditCoupleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: WeddingDetails) => void;
  weddingDetails: WeddingDetails;
}

export const EditCoupleModal: React.FC<EditCoupleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  weddingDetails,
}) => {
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [venue, setVenue] = useState('');
  const [totalBudgetLimit, setTotalBudgetLimit] = useState<number | ''>(250000000);
  const [tableCapacity, setTableCapacity] = useState<number>(10);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (weddingDetails) {
      setGroomName(weddingDetails.groomName || '');
      setBrideName(weddingDetails.brideName || '');
      setWeddingDate(weddingDetails.weddingDate || '');
      setVenue(weddingDetails.venue || '');
      setTotalBudgetLimit(weddingDetails.totalBudgetLimit || '');
      setTableCapacity(weddingDetails.tableCapacity || 10);
      setNotes(weddingDetails.notes || '');
    }
  }, [weddingDetails, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      groomName: groomName.trim(),
      brideName: brideName.trim(),
      weddingDate,
      venue: venue.trim(),
      totalBudgetLimit: Number(totalBudgetLimit) || 0,
      tableCapacity: Number(tableCapacity) || 10,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FCFAF7] max-w-lg w-full border border-[#D4C3B5] my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white p-5 border-b border-[#EBE3DC] flex items-center justify-between">
          <h3 className="font-serif italic text-2xl text-[#2D2926] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#2D2926]" />
            <span>Thông Tin Đám Cưới & Hạn Mức Ngân Sách</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#EBE3DC] text-[#2D2926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Tên Chú Rể <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Minh Đức"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-serif italic bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Tên Cô Dâu <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Thu Trang"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-serif italic bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>
          </div>

          {/* Date & Venue */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Ngày Tổ Chức Đám Cưới Chính Thức
            </label>
            <input
              type="date"
              required
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Địa Điểm Tổ Chức Tiệc Cưới
            </label>
            <input
              type="text"
              placeholder="VD: White Palace Phạm Văn Đồng, TPHCM"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          {/* Total Budget Target */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Hạn Mức Ngân Sách Mong Muốn (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              step="5000000"
              placeholder="VD: 250000000"
              value={totalBudgetLimit}
              onFocus={(e) => e.target.select()}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setTotalBudgetLimit(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          {/* Table Capacity / Seats Per Table */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Quy Mô / Loại Bàn Tiệc (Số Người / Bàn)
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {[10, 12, 8, 6, 5].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setTableCapacity(cap)}
                  className={`px-3 py-1 text-xs font-mono border transition-colors ${
                    tableCapacity === cap
                      ? 'bg-[#2D2926] text-white border-[#2D2926] font-bold'
                      : 'bg-white text-[#2D2926] border-[#EBE3DC] hover:border-[#2D2926]'
                  }`}
                >
                  {cap} người/bàn {cap === 10 ? '(Chuẩn)' : ''}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#2D2926]/70">Hoặc tự nhập:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={tableCapacity}
                onChange={(e) => setTableCapacity(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 px-3 py-1 text-xs font-mono bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
              <span className="text-xs text-[#2D2926]/60">người / bàn</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Ghi Chú Chung / Thông Điệp
            </label>
            <textarea
              rows={2}
              placeholder="VD: Lễ ăn hỏi buổi sáng, tiệc cưới buổi tối 300 khách..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
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
              <span>Cập nhật thông tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
