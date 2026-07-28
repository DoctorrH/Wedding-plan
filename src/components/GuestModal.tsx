import React, { useState, useEffect } from 'react';
import { X, Check, User, Phone, MapPin, FileText, Users } from 'lucide-react';
import { GuestItem, GuestGroup, GuestRSVPStatus, GUEST_GROUP_LABELS, PRIMARY_GUEST_GROUPS } from '../types';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guest: Omit<GuestItem, 'id'>, guestId?: string) => void;
  guestToEdit?: GuestItem | null;
}

export const GuestModal: React.FC<GuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  guestToEdit,
}) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<GuestGroup>('GROOM_FAMILY');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rsvp, setRsvp] = useState<GuestRSVPStatus>('PENDING');
  const [plusOnes, setPlusOnes] = useState<number | ''>('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (guestToEdit) {
      setName(guestToEdit.name);
      setGroup(guestToEdit.group);
      setPhone(guestToEdit.phone || '');
      setAddress(guestToEdit.address || '');
      setRsvp(guestToEdit.rsvp);
      setPlusOnes(guestToEdit.plusOnes || '');
      setTableNumber(guestToEdit.tableNumber || '');
      setNotes(guestToEdit.notes || '');
    } else {
      setName('');
      setGroup('GROOM_FAMILY');
      setPhone('');
      setAddress('');
      setRsvp('PENDING');
      setPlusOnes('');
      setTableNumber('');
      setNotes('');
    }
  }, [guestToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        group,
        phone: phone.trim(),
        address: address.trim(),
        rsvp,
        plusOnes: Number(plusOnes) || 0,
        tableNumber: tableNumber.trim(),
        notes: notes.trim(),
      },
      guestToEdit ? guestToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FCFAF7] max-w-lg w-full border border-[#D4C3B5] my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white p-5 border-b border-[#EBE3DC] flex items-center justify-between">
          <h3 className="font-serif italic text-2xl text-[#2D2926]">
            {guestToEdit ? 'Chỉnh Sửa Khách Mời' : 'Thêm Khách Mời Mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#EBE3DC] text-[#2D2926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Họ và Tên Khách Mời <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Anh Nguyễn Văn A, Bác Trần Thị B..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] font-serif italic text-[#2D2926]"
            />
          </div>

          {/* Group & RSVP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Nhóm khách mời
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value as GuestGroup)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              >
                {PRIMARY_GUEST_GROUPS.map((grpKey) => (
                  <option key={grpKey} value={grpKey}>
                    {GUEST_GROUP_LABELS[grpKey]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Trạng thái xác nhận (RSVP)
              </label>
              <select
                value={rsvp}
                onChange={(e) => setRsvp(e.target.value as GuestRSVPStatus)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              >
                <option value="ATTENDING">✓ Chắc chắn tham gia</option>
                <option value="MAYBE">❓ Có thể tham gia</option>
                <option value="DECLINED">✕ Không tham gia</option>
                <option value="PENDING">⏳ Chờ xác nhận</option>
              </select>
            </div>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                placeholder="VD: 0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Địa chỉ cư trú / gửi thiệp
              </label>
              <input
                type="text"
                placeholder="VD: Quận 1, TPHCM..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>
          </div>

          {/* Plus Ones & Table Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Số người đi cùng (Đi kèm)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={plusOnes}
                onFocus={(e) => e.target.select()}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => setPlusOnes(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Bàn tiệc dự kiến (Xếp bàn)
              </label>
              <input
                type="text"
                placeholder="VD: Bàn 01, Bàn VIP 02..."
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Ghi chú riêng cho khách mời
            </label>
            <textarea
              rows={2}
              placeholder="VD: Đại diện họ nhà gái phát biểu, ăn chay, đón tại sân bay..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          {/* Modal Actions */}
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
              <span>{guestToEdit ? 'Lưu thay đổi' : 'Thêm khách mời'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
