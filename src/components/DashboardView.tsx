import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  FileText,
  Building,
  Users
} from 'lucide-react';
import { TaskItem, GuestItem, WeddingDetails, CATEGORY_LABELS, TaskCategory } from '../types';
import { formatVND, formatShortVND } from '../lib/utils';

interface DashboardViewProps {
  tasks: TaskItem[];
  guests: GuestItem[];
  weddingDetails: WeddingDetails;
  categoryNames?: Record<TaskCategory, string>;
  onOpenAddTask: () => void;
  onOpenAddGuest: () => void;
  onSwitchTab: (tab: 'calendar' | 'tasks' | 'guests') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  guests,
  weddingDetails,
  categoryNames,
  onOpenAddTask,
  onOpenAddGuest,
  onSwitchTab,
}) => {
  // Financial Calculations
  const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimatedCost || 0), 0);
  const totalActual = tasks.reduce((sum, task) => sum + (task.actualCost || 0), 0);
  const totalDeposit = tasks.reduce((sum, task) => sum + (task.depositPaid || 0), 0);
  
  // Calculate remaining payable: use actualCost if > 0, else estimatedCost
  const totalRemainingToPay = tasks.reduce((sum, task) => {
    const costToUse = task.actualCost > 0 ? task.actualCost : task.estimatedCost;
    const remaining = Math.max(0, costToUse - (task.depositPaid || 0));
    return sum + remaining;
  }, 0);

  // Budget Limit Comparison
  const budgetLimit = weddingDetails.totalBudgetLimit || 250000000;
  const isOverBudget = totalActual > budgetLimit;
  const budgetUsedPercentage = Math.min(100, Math.round((totalActual / budgetLimit) * 100));

  // Task Stats
  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todoTasksCount = tasks.filter(t => t.status === 'TODO').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Guest Stats
  const totalGuests = guests.length;
  const attendingGuests = guests.filter(g => g.rsvp === 'ATTENDING');
  const maybeGuests = guests.filter(g => g.rsvp === 'MAYBE');
  const attendingPlusOnes = attendingGuests.reduce((sum, g) => sum + (g.plusOnes || 0), 0);
  const totalAttendingHeadcount = attendingGuests.length + attendingPlusOnes;
  const estimatedTables = Math.ceil(totalAttendingHeadcount / 10);

  // Group costs by Category
  const categoryStats: Record<TaskCategory, { estimated: number; actual: number; deposit: number; count: number }> = {
    LE_GIA_TIEN: { estimated: 0, actual: 0, deposit: 0, count: 0 },
    TRANG_PHUC: { estimated: 0, actual: 0, deposit: 0, count: 0 },
    TIEC_CUOI: { estimated: 0, actual: 0, deposit: 0, count: 0 },
    CHUP_ANH: { estimated: 0, actual: 0, deposit: 0, count: 0 },
    THIEP_MOI: { estimated: 0, actual: 0, deposit: 0, count: 0 },
    NHAN_CUOI: { estimated: 0, actual: 0, deposit: 0, count: 0 },
    XE_HOA_DECOR: { estimated: 0, actual: 0, deposit: 0, count: 0 },
    KHAC: { estimated: 0, actual: 0, deposit: 0, count: 0 },
  };

  tasks.forEach(t => {
    if (categoryStats[t.category]) {
      categoryStats[t.category].estimated += t.estimatedCost || 0;
      categoryStats[t.category].actual += t.actualCost || 0;
      categoryStats[t.category].deposit += t.depositPaid || 0;
      categoryStats[t.category].count += 1;
    }
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Tổng Dự Toán */}
        <div className="bg-white p-6 border border-[#EBE3DC] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="uppercase text-[11px] tracking-[0.18em] font-bold text-[#1A1816]">
                Tổng Dự Toán
              </span>
              <div className="p-2 bg-[#F5F1EE] text-[#1A1816]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#1A1816] mb-1">
              {formatVND(totalEstimated)}
            </div>
          </div>
          <p className="text-xs font-semibold text-[#1A1816] mt-3 pt-2 border-t border-[#F5F1EE] flex items-center justify-between">
            <span>Hạn mức mong muốn:</span>
            <span className="font-mono font-bold text-[#1A1816]">{formatVND(budgetLimit)}</span>
          </p>
        </div>

        {/* Card 2: Total Investment (Featured Dark Card) */}
        <div className="bg-[#1A1816] text-[#FCFAF7] p-6 border border-[#1A1816] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="uppercase text-[11px] tracking-[0.18em] font-bold text-[#FCFAF7]">
                Tổng Chi Phí Thực Tế
              </span>
              <div className="p-2 bg-white/20 text-[#FCFAF7]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#FCFAF7] mb-2">
              {formatVND(totalActual)}
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-white/20">
            <div className="flex justify-between text-xs uppercase tracking-widest font-bold text-[#FCFAF7]">
              <span>Đã dùng</span>
              <span>{budgetUsedPercentage}%</span>
            </div>
            <div className="w-full bg-white/30 h-1.5">
              <div 
                className="bg-[#D4C3B5] h-full"
                style={{ width: `${Math.min(100, budgetUsedPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Đã Đặt Cọc */}
        <div className="bg-white p-6 border border-[#EBE3DC] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="uppercase text-[11px] tracking-[0.18em] font-bold text-[#1A1816]">
                Tổng Tiền Đã Cọc
              </span>
              <div className="p-2 bg-[#F5F1EE] text-[#1A1816]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#1A1816] mb-1">
              {formatVND(totalDeposit)}
            </div>
          </div>
          <p className="text-xs font-semibold text-[#1A1816] mt-3 pt-2 border-t border-[#F5F1EE]">
            Đã ứng trước cho các nhà cung cấp
          </p>
        </div>

        {/* Card 4: Còn Lại Phải Thanh Toán */}
        <div className="bg-[#F5F1EE] p-6 border border-[#D4C3B5] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="uppercase text-[11px] tracking-[0.18em] font-bold text-[#1A1816]">
                Còn Phải Thanh Toán
              </span>
              <div className="p-2 bg-white text-[#1A1816] border border-[#D4C3B5]">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold tracking-tight text-[#1A1816] mb-1">
              {formatVND(totalRemainingToPay)}
            </div>
          </div>
          <p className="text-xs font-semibold text-[#1A1816] mt-3 pt-2 border-t border-[#D4C3B5]">
            Số tiền còn lại bàn giao sau lễ
          </p>
        </div>
      </div>

      {/* Editorial Overview Progress & Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Box 1: Công việc cưới */}
        <div className="bg-white p-6 border border-[#EBE3DC] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5F1EE] pb-3">
            <h3 className="font-serif italic text-xl text-[#2D2926]">Tiến Độ Công Việc</h3>
            <button
              onClick={() => onSwitchTab('tasks')}
              className="uppercase text-[10px] tracking-widest text-[#2D2926]/60 hover:text-[#2D2926] transition-colors"
              id="btn-switch-to-tasks"
            >
              Xem chi tiết →
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-[#2D2926]">
              <span>Tỷ lệ hoàn thành:</span>
              <span className="font-mono font-bold text-sm">{taskCompletionRate}%</span>
            </div>
            <div className="w-full bg-[#F5F1EE] h-1.5">
              <div
                className="bg-[#2D2926] h-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="bg-[#FCFAF7] p-3 border border-[#EBE3DC]">
              <div className="text-xl font-serif text-[#2D2926]">{completedTasksCount}</div>
              <div className="uppercase text-[9px] tracking-wider text-[#2D2926]/60 mt-1">Hoàn thành</div>
            </div>
            <div className="bg-[#FCFAF7] p-3 border border-[#EBE3DC]">
              <div className="text-xl font-serif text-[#2D2926]">{inProgressTasksCount}</div>
              <div className="uppercase text-[9px] tracking-wider text-[#2D2926]/60 mt-1">Đang làm</div>
            </div>
            <div className="bg-[#FCFAF7] p-3 border border-[#EBE3DC]">
              <div className="text-xl font-serif text-[#2D2926]">{todoTasksCount}</div>
              <div className="uppercase text-[9px] tracking-wider text-[#2D2926]/60 mt-1">Chưa làm</div>
            </div>
          </div>
        </div>

        {/* Progress Box 2: Khách Mời & Bàn Tiệc */}
        <div className="bg-white p-6 border border-[#EBE3DC] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5F1EE] pb-3">
            <h3 className="font-serif italic text-xl text-[#2D2926]">Thống Kê Khách Mời</h3>
            <button
              onClick={() => onSwitchTab('guests')}
              className="uppercase text-[10px] tracking-widest text-[#2D2926]/60 hover:text-[#2D2926] transition-colors"
              id="btn-switch-to-guests"
            >
              Xem danh sách →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#FCFAF7] p-3 border border-[#EBE3DC]">
              <div className="text-2xl font-serif text-[#2D2926]">{totalAttendingHeadcount}</div>
              <div className="uppercase text-[9px] tracking-wider text-[#2D2926]/60 mt-1">Tổng người dự (Gồm đi kèm)</div>
            </div>
            <div className="bg-[#FCFAF7] p-3 border border-[#EBE3DC]">
              <div className="text-2xl font-serif text-[#2D2926]">~{estimatedTables} bàn</div>
              <div className="uppercase text-[9px] tracking-wider text-[#2D2926]/60 mt-1">Dự kiến (10 người/bàn)</div>
            </div>
          </div>

          <div className="text-xs text-[#2D2926] flex justify-between items-center bg-[#F5F1EE] p-3 border border-[#EBE3DC]">
            <span className="uppercase text-[10px] tracking-wider text-[#2D2926]/70">Đồng ý tham gia:</span>
            <span className="font-mono font-bold">
              {attendingGuests.length} / {totalGuests} thiệp ({totalGuests > 0 ? Math.round((attendingGuests.length / totalGuests) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Box 3: Phân bổ Ngân sách Theo Danh Mục */}
        <div className="bg-white p-6 border border-[#EBE3DC] space-y-3">
          <div className="flex items-center justify-between border-b border-[#F5F1EE] pb-3">
            <h3 className="font-serif italic text-xl text-[#2D2926]">Phân Bổ Ngân Sách</h3>
            <span className="uppercase text-[9px] tracking-widest text-[#2D2926]/50">Theo Danh Mục</span>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map(catKey => {
              const catLabel = categoryNames?.[catKey] || CATEGORY_LABELS[catKey].label;
              const stat = categoryStats[catKey];
              const cost = stat.actual > 0 ? stat.actual : stat.estimated;
              const percent = totalEstimated > 0 ? Math.round((cost / totalEstimated) * 100) : 0;

              if (cost === 0 && stat.count === 0) return null;

              return (
                <div key={catKey} className="text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#2D2926] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#2D2926]" />
                      {catLabel} ({stat.count})
                    </span>
                    <span className="font-mono font-bold text-[#2D2926]">{formatShortVND(cost)} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-[#F5F1EE] h-1">
                    <div 
                      className="bg-[#D4C3B5] h-full" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editorial Detailed Budget Table & Sum */}
      <div className="bg-white border border-[#EBE3DC] overflow-hidden">
        <div className="p-6 border-b border-[#F5F1EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FCFAF7]">
          <div>
            <h2 className="font-serif italic text-2xl text-[#2D2926]">
              Dự Toán & Thực Chi Ngân Sách Chi Tiết
            </h2>
            <p className="uppercase text-[10px] tracking-[0.2em] text-[#2D2926]/60 mt-1">
              Bảng kê các khoản dự tính, tiền đặt cọc và nghĩa vụ tài chính còn lại
            </p>
          </div>
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2D2926] hover:bg-[#423D38] text-[#FCFAF7] text-xs uppercase tracking-wider font-semibold transition-colors border border-[#2D2926]"
            id="btn-add-budget-item"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Mục Chi Phí</span>
          </button>
        </div>

        {/* Table View - Editorial Minimalist Style */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="uppercase text-[10px] tracking-wider text-[#2D2926]/60 border-b border-[#EBE3DC] bg-[#FCFAF7]">
              <tr>
                <th className="py-3 px-4 font-normal">Hạng Mục / Công Việc</th>
                <th className="py-3 px-3 font-normal">Danh Mục</th>
                <th className="py-3 px-3 font-normal text-right">Dự Toán (VNĐ)</th>
                <th className="py-3 px-3 font-normal text-right">Thực Chi (VNĐ)</th>
                <th className="py-3 px-3 font-normal text-right">Đã Đặt Cọc</th>
                <th className="py-3 px-3 font-normal text-right">Còn Phải Trả</th>
                <th className="py-3 px-4 font-normal">Ghi Chú & Nhà Cung Cấp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F1EE] text-[#2D2926]">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#2D2926]/50 italic">
                    Chưa có hạng mục chi phí nào. Nhấn "Thêm Mục Chi Phí" để khởi tạo kế hoạch!
                  </td>
                </tr>
              ) : (
                tasks.map((task, idx) => {
                  const catLabel = categoryNames?.[task.category] || CATEGORY_LABELS[task.category]?.label || task.category;
                  const costToUse = task.actualCost > 0 ? task.actualCost : task.estimatedCost;
                  const remaining = Math.max(0, costToUse - (task.depositPaid || 0));

                  return (
                    <tr key={task.id} className="hover:bg-[#FCFAF7] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#2D2926]">
                        <div className="flex items-center gap-2">
                          <span className="text-[#2D2926]/40 text-[10px] font-mono">{idx + 1}.</span>
                          <span>{task.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 border border-[#D4C3B5] bg-[#F5F1EE] text-[#2D2926]">
                          {catLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-[#2D2926]">
                        {formatVND(task.estimatedCost)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#2D2926]">
                        {task.actualCost > 0 ? formatVND(task.actualCost) : <span className="text-[#2D2926]/40 italic">Chưa chi</span>}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-[#2D2926]/80">
                        {formatVND(task.depositPaid)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#2D2926]">
                        {formatVND(remaining)}
                      </td>
                      <td className="py-3.5 px-4 italic text-[#2D2926]/70 max-w-xs">
                        {task.vendorName && (
                          <div className="font-semibold not-italic text-[#2D2926]">{task.vendorName} {task.vendorContact && `(${task.vendorContact})`}</div>
                        )}
                        <p className="truncate">{task.notes || '—'}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Editorial Footer Total Summary Banner */}
            <tfoot>
              <tr className="bg-[#2D2926] text-[#FCFAF7]">
                <td colSpan={2} className="py-4 px-4 font-serif italic text-base tracking-wide">
                  TỔNG CỘNG CHI PHÍ CẦN BỎ RA:
                </td>
                <td className="py-4 px-3 text-right font-mono text-[#D4C3B5]">
                  {formatVND(totalEstimated)}
                </td>
                <td className="py-4 px-3 text-right font-mono text-white text-sm font-bold">
                  {formatVND(totalActual)}
                </td>
                <td className="py-4 px-3 text-right font-mono text-[#D4C3B5]">
                  {formatVND(totalDeposit)}
                </td>
                <td className="py-4 px-3 text-right font-mono text-white text-sm font-bold underline decoration-1 underline-offset-4">
                  {formatVND(totalRemainingToPay)}
                </td>
                <td className="py-4 px-4 text-[10px] uppercase tracking-wider text-[#FCFAF7]/60">
                  *TỔNG DỰ TOÁN, THỰC CHI, ĐÃ CỌC & DƯ NỢ CÒN LẠI.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
