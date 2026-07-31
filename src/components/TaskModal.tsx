import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar as CalendarIcon, Building, FileText, Plus } from 'lucide-react';
import { TaskItem, TaskCategory, TaskStatus, CATEGORY_LABELS } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<TaskItem, 'id'>, taskId?: string) => void;
  taskToEdit?: TaskItem | null;
  initialDate?: string | null;
  initialCategory?: TaskCategory | null;
  categoryNames?: Record<TaskCategory, string>;
  onAddCategory?: (categoryName: string) => string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  initialDate,
  initialCategory,
  categoryNames,
  onAddCategory,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('TIEC_CUOI');
  const [dueDate, setDueDate] = useState('');
  const [targetMonth, setTargetMonth] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [estimatedCost, setEstimatedCost] = useState<number | ''>('');
  const [actualCost, setActualCost] = useState<number | ''>('');
  const [depositPaid, setDepositPaid] = useState<number | ''>('');
  const [vendorName, setVendorName] = useState('');
  const [vendorContact, setVendorContact] = useState('');
  const [notes, setNotes] = useState('');

  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatNameInput, setNewCatNameInput] = useState('');

  const allCatKeys = Array.from(new Set([
    ...Object.keys(CATEGORY_LABELS),
    ...Object.keys(categoryNames || {})
  ]));

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate || '');
      setTargetMonth(taskToEdit.targetMonth || (taskToEdit.dueDate ? taskToEdit.dueDate.substring(0, 7) : ''));
      setStatus(taskToEdit.status);
      setEstimatedCost(taskToEdit.estimatedCost || '');
      setActualCost(taskToEdit.actualCost || '');
      setDepositPaid(taskToEdit.depositPaid || '');
      setVendorName(taskToEdit.vendorName || '');
      setVendorContact(taskToEdit.vendorContact || '');
      setNotes(taskToEdit.notes || '');
    } else {
      const defaultDate = initialDate || new Date().toISOString().split('T')[0];
      setTitle('');
      setCategory(initialCategory || 'TIEC_CUOI');
      setDueDate(defaultDate);
      setTargetMonth(defaultDate.substring(0, 7));
      setStatus('TODO');
      setEstimatedCost('');
      setActualCost('');
      setDepositPaid('');
      setVendorName('');
      setVendorContact('');
      setNotes('');
    }
  }, [taskToEdit, initialDate, initialCategory, isOpen]);

  // Keep targetMonth in sync with dueDate
  const handleDateChange = (dateVal: string) => {
    setDueDate(dateVal);
    if (dateVal && dateVal.length >= 7) {
      setTargetMonth(dateVal.substring(0, 7));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        title: title.trim(),
        category,
        dueDate,
        targetMonth: targetMonth || (dueDate ? dueDate.substring(0, 7) : ''),
        status,
        estimatedCost: Number(estimatedCost) || 0,
        actualCost: Number(actualCost) || 0,
        depositPaid: Number(depositPaid) || 0,
        vendorName: vendorName.trim(),
        vendorContact: vendorContact.trim(),
        notes: notes.trim(),
      },
      taskToEdit ? taskToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FCFAF7] max-w-xl w-full border border-[#D4C3B5] my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white p-5 border-b border-[#EBE3DC] flex items-center justify-between">
          <h3 className="font-serif italic text-2xl text-[#2D2926]">
            {taskToEdit ? 'Chỉnh Sửa Công Việc & Chi Phí' : 'Thêm Công Việc Mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#EBE3DC] text-[#2D2926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Tên công việc / Hạng mục <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Thuê váy cưới cô dâu, Đặt cọc nhà hàng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926]">
                  Danh mục công việc
                </label>
                {onAddCategory && !isAddingNewCat && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(true)}
                    className="text-[10px] uppercase font-bold text-emerald-800 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm danh mục</span>
                  </button>
                )}
              </div>

              {isAddingNewCat ? (
                <div className="flex items-center gap-1.5 bg-emerald-50/80 p-1.5 border border-emerald-300">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Tên danh mục mới..."
                    value={newCatNameInput}
                    onChange={(e) => setNewCatNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newCatNameInput.trim() && onAddCategory) {
                          const created = onAddCategory(newCatNameInput.trim());
                          if (created) setCategory(created);
                          setNewCatNameInput('');
                          setIsAddingNewCat(false);
                        }
                      }
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-white border border-emerald-300 focus:outline-none text-[#2D2926]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCatNameInput.trim() && onAddCategory) {
                        const created = onAddCategory(newCatNameInput.trim());
                        if (created) setCategory(created);
                        setNewCatNameInput('');
                        setIsAddingNewCat(false);
                      }
                    }}
                    className="px-2.5 py-1 bg-emerald-800 text-white text-xs font-semibold uppercase hover:bg-emerald-900"
                  >
                    Tạo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewCat(false);
                      setNewCatNameInput('');
                    }}
                    className="px-2 py-1 bg-slate-200 text-slate-700 text-xs hover:bg-slate-300"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
                >
                  {allCatKeys.map((catKey) => (
                    <option key={catKey} value={catKey}>
                      {categoryNames?.[catKey] || CATEGORY_LABELS[catKey]?.label || catKey}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Trạng thái tiến độ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              >
                <option value="TODO">Chưa bắt đầu</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Due Date & Target Month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Ngày thực hiện / Hạn chót
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Tháng thực hiện (YYYY-MM)
              </label>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>
          </div>

          {/* FINANCIAL SECTION */}
          <div className="bg-white p-4 border border-[#EBE3DC] space-y-3">
            <h4 className="text-[10px] font-bold text-[#2D2926] uppercase tracking-[0.2em] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#2D2926]" />
              <span>Dự Toán & Chi Phí Thực Tế (VNĐ)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#2D2926]/70 mb-1">
                  1. Chi phí dự toán
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  placeholder="0"
                  value={estimatedCost}
                  onFocus={(e) => e.target.select()}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => setEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF7] border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#2D2926]/70 mb-1">
                  2. Thực tế đã chi
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  placeholder="0"
                  value={actualCost}
                  onFocus={(e) => e.target.select()}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => setActualCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF7] border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#2D2926]/70 mb-1">
                  3. Số tiền đã cọc / thanh toán
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  placeholder="0"
                  value={depositPaid}
                  onFocus={(e) => e.target.select()}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => setDepositPaid(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FCFAF7] border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
                />
              </div>
            </div>
          </div>

          {/* Vendor Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Tên nhà cung cấp / Nhà hàng / Studio
              </label>
              <input
                type="text"
                placeholder="VD: White Palace, PNJ..."
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Số điện thoại liên hệ đối tác
              </label>
              <input
                type="text"
                placeholder="VD: 0901234567"
                value={vendorContact}
                onChange={(e) => setVendorContact(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
              />
            </div>
          </div>

          {/* Specific Notes */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
              Ghi chú cụ thể cho mục này
            </label>
            <textarea
              rows={3}
              placeholder="Nhập ghi chú chi tiết: địa chỉ, gói dịch vụ, yêu cầu riêng, danh mục vật dụng..."
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
              <span>{taskToEdit ? 'Lưu thay đổi' : 'Thêm công việc'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
