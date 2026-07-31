import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Plus, 
  X, 
  DollarSign, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { TaskItem, CATEGORY_LABELS, TASK_STATUS_LABELS, TaskCategory } from '../types';
import { formatVND } from '../lib/utils';

interface CalendarViewProps {
  tasks: TaskItem[];
  weddingDate: string;
  onOpenAddTaskWithDate: (dateStr: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onEditTask: (task: TaskItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  weddingDate,
  onOpenAddTaskWithDate,
  onToggleTaskStatus,
  onEditTask,
}) => {
  // Default month and year to current date (Hôm nay) when opened
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  const [currentYear, setCurrentYear] = useState<number>(todayObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayObj.getMonth()); // 0-indexed (0 = Jan)

  // Selected Day Drawer state
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(todayObj.getFullYear());
    setCurrentMonth(todayObj.getMonth());
    setSelectedDayStr(todayStr);
  };

  // Generate days matrix for current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Day of week offset (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

  const totalDaysInMonth = lastDayOfMonth.getDate();

  const formattedMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // Filter tasks for this month
  const monthTasks = tasks.filter(t => {
    if (t.dueDate) {
      return t.dueDate.startsWith(formattedMonthStr);
    }
    return t.targetMonth === formattedMonthStr;
  });

  const monthCompletedCount = monthTasks.filter(t => t.status === 'COMPLETED').length;
  const monthTotalCost = monthTasks.reduce((sum, t) => sum + (t.actualCost > 0 ? t.actualCost : t.estimatedCost), 0);

  // Helper to map tasks to day numbers
  const tasksByDay: Record<number, TaskItem[]> = {};
  monthTasks.forEach(t => {
    if (t.dueDate) {
      const parts = t.dueDate.split('-');
      if (parts.length === 3) {
        const dayNum = parseInt(parts[2], 10);
        if (!tasksByDay[dayNum]) tasksByDay[dayNum] = [];
        tasksByDay[dayNum].push(t);
      }
    }
  });

  // Selected day's tasks
  const selectedDayNum = selectedDayStr ? parseInt(selectedDayStr.split('-')[2], 10) : null;
  const selectedDayTasks = selectedDayNum ? (tasksByDay[selectedDayNum] || []) : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Month Navigation & Summary Header - Editorial Style */}
      <div className="bg-white p-6 border border-[#EBE3DC] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-[#D4C3B5] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#FCFAF7] transition-colors"
            title="Tháng trước"
            id="btn-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-serif italic font-bold text-[#1A1816] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#1A1816]" />
              <span>Tháng {currentMonth + 1} / {currentYear}</span>
            </h2>
            <p className="uppercase text-[11px] font-bold tracking-[0.18em] text-[#1A1816] mt-0.5">
              {monthTasks.length} CÔNG VIỆC TRONG THÁNG • {monthCompletedCount}/{monthTasks.length} ĐÃ HOÀN THÀNH
            </p>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 border border-[#D4C3B5] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#FCFAF7] transition-colors"
            title="Tháng sau"
            id="btn-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 border border-[#2D2926] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#FCFAF7] text-xs font-semibold uppercase tracking-wider transition-colors ml-1"
            title="Xem hôm nay"
            id="btn-go-today"
          >
            Hôm nay
          </button>
        </div>

        {/* Quick Month Tabs for Wedding Season */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          {[-3, -2, -1, 0, 1, 2].map(offset => {
            const date = new Date(currentYear, currentMonth + offset, 1);
            const m = date.getMonth();
            const y = date.getFullYear();
            const isSelected = m === currentMonth && y === currentYear;

            return (
              <button
                key={offset}
                onClick={() => {
                  setCurrentMonth(m);
                  setCurrentYear(y);
                }}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#2D2926] text-[#FCFAF7] border-[#2D2926] font-bold'
                    : 'bg-[#FCFAF7] text-[#2D2926] border-[#EBE3DC] hover:border-[#D4C3B5]'
                }`}
              >
                T{m + 1}/{y}
              </button>
            );
          })}
        </div>

        {/* Month Summary Badge */}
        <div className="bg-[#FCFAF7] border border-[#D4C3B5] px-4 py-2.5 text-right min-w-[180px]">
          <div className="uppercase text-[9px] tracking-widest text-[#2D2926]/60">Dự kiến chi tháng này</div>
          <div className="text-lg font-serif text-[#2D2926]">{formatVND(monthTotalCost)}</div>
        </div>
      </div>

      {/* Editorial Calendar Grid */}
      <div className="bg-white border border-[#EBE3DC] overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-[#F3EEEA] border-b border-[#DCD3CC] text-center py-3 text-xs uppercase font-bold tracking-[0.18em] text-[#1A1816]">
          <div>T2</div>
          <div>T3</div>
          <div>T4</div>
          <div>T5</div>
          <div>T6</div>
          <div>T7</div>
          <div>CN</div>
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#EBE3DC] bg-[#FCFAF7]/20 border-b border-[#EBE3DC]">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-[#FCFAF7]/50 p-1" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: totalDaysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isWeddingDay = weddingDate === dateStr;
            const dayTasks = tasksByDay[dayNum] || [];

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDayStr(dateStr)}
                className={`min-h-[110px] p-2 transition-colors cursor-pointer group relative flex flex-col justify-between ${
                  isWeddingDay 
                    ? 'bg-[#D4C3B5]/30 border-2 border-[#2D2926]' 
                    : isToday 
                    ? 'bg-[#F5F1EE]' 
                    : 'hover:bg-[#FCFAF7] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-serif ${
                      isWeddingDay
                        ? 'bg-[#2D2926] text-[#FCFAF7] font-bold'
                        : isToday
                        ? 'border border-[#2D2926] font-bold'
                        : 'text-[#2D2926]'
                    }`}>
                      {dayNum}
                    </span>

                    {isWeddingDay && (
                      <span className="text-[9px] bg-[#2D2926] text-[#FCFAF7] uppercase tracking-widest px-1.5 py-0.5">
                        NGÀY CƯỚI 💖
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddTaskWithDate(dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2D2926] hover:text-[#FCFAF7] text-[#2D2926] transition-all text-xs border border-[#D4C3B5]"
                      title="Thêm công việc vào ngày này"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Tasks on this day */}
                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 3).map(task => {
                      const isDone = task.status === 'COMPLETED';
                      const isPending = task.status === 'IN_PROGRESS';

                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDayStr(dateStr);
                          }}
                          className={`text-[10px] p-1 border border-[#EBE3DC] truncate font-sans transition-all ${
                            isDone
                              ? 'bg-[#F5F1EE] text-[#2D2926]/50 line-through'
                              : isPending
                              ? 'bg-[#2D2926] text-[#FCFAF7] font-medium'
                              : 'bg-[#FCFAF7] text-[#2D2926]'
                          }`}
                          title={`${task.title} - ${formatVND(task.estimatedCost)}`}
                        >
                          {isDone ? '✓ ' : isPending ? '⏳ ' : '• '}
                          {task.title}
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <div className="text-[9px] uppercase tracking-widest text-[#2D2926]/70 text-center bg-[#F5F1EE] border border-[#EBE3DC] py-0.5">
                        +{dayTasks.length - 3} mục khác
                      </div>
                    )}
                  </div>
                </div>

                {/* Day bottom hint */}
                {dayTasks.length > 0 && (
                  <div className="text-[9px] text-[#2D2926]/50 font-mono text-right mt-1">
                    {dayTasks.filter(t => t.status === 'COMPLETED').length}/{dayTasks.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Modal / Side Drawer - Editorial Aesthetic */}
      {selectedDayStr && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-[#FCFAF7] h-full border-l border-[#D4C3B5] p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#EBE3DC] pb-4">
                <div>
                  <h3 className="text-2xl font-serif italic text-[#2D2926]">
                    Công Việc Ngày {new Date(selectedDayStr).toLocaleDateString('vi-VN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <p className="uppercase text-[10px] tracking-[0.2em] text-[#2D2926]/60 mt-1">
                    {selectedDayTasks.length} công việc đã lên kế hoạch
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDayStr(null)}
                  className="p-1.5 hover:bg-[#EBE3DC] text-[#2D2926] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Task list for selected day */}
              {selectedDayTasks.length === 0 ? (
                <div className="py-12 text-center text-[#2D2926]/50 space-y-4">
                  <CalendarIcon className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm font-serif italic">Chưa có công việc nào trong ngày này.</p>
                  <button
                    onClick={() => onOpenAddTaskWithDate(selectedDayStr)}
                    className="px-4 py-2.5 bg-[#2D2926] text-[#FCFAF7] text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm công việc mới</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayTasks.map(task => {
                    const cat = CATEGORY_LABELS[task.category];

                    return (
                      <div
                        key={task.id}
                        className="bg-white border border-[#EBE3DC] p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-[#D4C3B5] bg-[#F5F1EE] text-[#2D2926]">
                              {cat?.label}
                            </span>
                            <h4 className="font-semibold text-[#2D2926] text-sm leading-snug">
                              {task.title}
                            </h4>
                          </div>
                          <button
                            onClick={() => onToggleTaskStatus(task.id)}
                            className={`p-1.5 text-[10px] uppercase tracking-wider font-semibold border transition-colors ${
                              task.status === 'COMPLETED'
                                ? 'bg-[#2D2926] text-[#FCFAF7] border-[#2D2926]'
                                : 'bg-white text-[#2D2926] border-[#D4C3B5] hover:bg-[#F5F1EE]'
                            }`}
                            title="Thay đổi trạng thái"
                          >
                            {task.status === 'COMPLETED' ? '✓ Đã Xong' : 'Chưa Xong'}
                          </button>
                        </div>

                        {/* Cost info */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-[#FCFAF7] p-2.5 border border-[#EBE3DC]">
                          <div>
                            <span className="uppercase text-[9px] tracking-wider text-[#2D2926]/50 block">Dự toán:</span>
                            <span className="font-mono font-medium text-[#2D2926]">{formatVND(task.estimatedCost)}</span>
                          </div>
                          <div>
                            <span className="uppercase text-[9px] tracking-wider text-[#2D2926]/50 block">Đã cọc/TT:</span>
                            <span className="font-mono font-medium text-[#2D2926]">{formatVND(task.depositPaid)}</span>
                          </div>
                        </div>

                        {/* Vendor & Notes */}
                        {task.vendorName && (
                          <div className="text-xs text-[#2D2926]">
                            📍 Đơn vị: {task.vendorName} {task.vendorContact && `(${task.vendorContact})`}
                          </div>
                        )}
                        {task.notes && (
                          <p className="text-xs text-[#2D2926]/70 italic bg-[#FCFAF7] p-2 border border-[#EBE3DC]">
                            📝 {task.notes}
                          </p>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setSelectedDayStr(null);
                              onEditTask(task);
                            }}
                            className="text-[10px] uppercase tracking-widest text-[#2D2926]/70 hover:text-[#2D2926] underline"
                          >
                            Chỉnh sửa chi tiết →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-4 border-t border-[#EBE3DC]">
              <button
                onClick={() => {
                  onOpenAddTaskWithDate(selectedDayStr);
                  setSelectedDayStr(null);
                }}
                className="w-full py-3 bg-[#2D2926] text-[#FCFAF7] font-semibold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm công việc ngày {selectedDayStr.split('-')[2]}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
