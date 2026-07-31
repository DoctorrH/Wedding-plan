import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Edit3, 
  Trash2, 
  MoreVertical,
  ChevronDown,
  Building,
  Phone,
  FileText,
  FileSpreadsheet,
  FolderEdit,
  FolderPlus,
  Layers,
  List
} from 'lucide-react';
import { 
  TaskItem, 
  TaskCategory, 
  TaskStatus, 
  CATEGORY_LABELS, 
  TASK_STATUS_LABELS 
} from '../types';
import { formatVND } from '../lib/utils';

interface TaskListViewProps {
  tasks: TaskItem[];
  categoryNames?: Record<TaskCategory, string>;
  onOpenAddTask: (defaultCategory?: TaskCategory) => void;
  onOpenAddCategory?: () => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onEditCategoryName?: (categoryKey: TaskCategory, currentName: string) => void;
  onDeleteCategory?: (categoryKey: TaskCategory) => void;
  onExportExcel?: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  categoryNames,
  onOpenAddTask,
  onOpenAddCategory,
  onEditTask,
  onDeleteTask,
  onToggleTaskStatus,
  onEditCategoryName,
  onDeleteCategory,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GROUPED' | 'LIST'>('GROUPED');

  // Extract unique target months for dropdown filter
  const uniqueMonths = Array.from(
    new Set(tasks.map(t => t.targetMonth || (t.dueDate ? t.dueDate.substring(0, 7) : '')))
  ).filter(Boolean).sort();

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.vendorName && task.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || task.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || task.status === selectedStatus;
    
    const taskMonth = task.targetMonth || (task.dueDate ? task.dueDate.substring(0, 7) : '');
    const matchesMonth = selectedMonth === 'ALL' || taskMonth === selectedMonth;

    return matchesSearch && matchesCategory && matchesStatus && matchesMonth;
  });

  // Calculate sum for current filtered tasks
  const filteredTotalEstimated = filteredTasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  const filteredTotalActual = filteredTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
  const filteredTotalDeposit = filteredTasks.reduce((sum, t) => sum + (t.depositPaid || 0), 0);
  const filteredTotalRemaining = filteredTasks.reduce((sum, t) => {
    const costToUse = t.actualCost > 0 ? t.actualCost : t.estimatedCost;
    return sum + Math.max(0, costToUse - (t.depositPaid || 0));
  }, 0);

  const allCategoryKeys = Array.from(
    new Set([
      ...Object.keys(CATEGORY_LABELS),
      ...Object.keys(categoryNames || {}),
      ...tasks.map(t => t.category),
    ])
  );

  const getCategoryLabel = (catKey: TaskCategory) => {
    return categoryNames?.[catKey] || CATEGORY_LABELS[catKey]?.label || catKey;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls Bar - Editorial Style */}
      <div className="bg-white p-6 border border-[#EBE3DC] space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif italic font-bold text-[#1A1816]">
              Quản Lý Công Việc & Ngân Sách Theo Danh Mục
            </h2>
            <p className="uppercase text-[11px] font-bold tracking-[0.18em] text-[#1A1816] mt-1">
              Bạn có thể chỉnh sửa tên danh mục, nội dung chi tiết & chi phí từng mục
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-[#EBE3DC] bg-[#FCFAF7] p-1">
              <button
                onClick={() => setViewMode('GROUPED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-colors ${
                  viewMode === 'GROUPED'
                    ? 'bg-[#2D2926] text-[#FCFAF7]'
                    : 'text-[#2D2926]/70 hover:text-[#2D2926]'
                }`}
                title="Chia theo danh mục"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theo danh mục</span>
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-colors ${
                  viewMode === 'LIST'
                    ? 'bg-[#2D2926] text-[#FCFAF7]'
                    : 'text-[#2D2926]/70 hover:text-[#2D2926]'
                }`}
                title="Danh sách tất cả"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tất cả</span>
              </button>
            </div>



            {onOpenAddCategory && (
              <button
                onClick={onOpenAddCategory}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#2D2926] text-[#2D2926] font-semibold text-xs uppercase tracking-wider transition-colors hover:bg-[#F5F1EE]"
                id="btn-add-category"
                title="Thêm danh mục công việc mới"
              >
                <FolderPlus className="w-4 h-4 text-[#2D2926]" />
                <span>Thêm Danh Mục</span>
              </button>
            )}

            <button
              onClick={() => onOpenAddTask()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2D2926] text-[#FCFAF7] font-semibold text-xs uppercase tracking-wider transition-colors hover:bg-black"
              id="btn-add-new-task"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Công Việc Mới</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#EBE3DC]">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#2D2926]/40" />
            <input
              type="text"
              placeholder="Tìm công việc, đơn vị, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FCFAF7] border border-[#EBE3DC] focus:bg-white focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EBE3DC] focus:bg-white focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
          >
            <option value="ALL">Tất cả danh mục ({tasks.length})</option>
            {allCategoryKeys.map(catKey => (
              <option key={catKey} value={catKey}>
                {getCategoryLabel(catKey)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EBE3DC] focus:bg-white focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="TODO">Chưa bắt đầu</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EBE3DC] focus:bg-white focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
          >
            <option value="ALL">Tất cả tháng</option>
            {uniqueMonths.map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area: Grouped or Flat List */}
      {viewMode === 'GROUPED' ? (
        /* GROUPED BY CATEGORY VIEW */
        <div className="space-y-6">
          {allCategoryKeys.map((catKey) => {
            if (selectedCategory !== 'ALL' && selectedCategory !== catKey) return null;

            const categoryTasks = filteredTasks.filter(t => t.category === catKey);
            const label = getCategoryLabel(catKey);

            // Category Totals
            const catEstimated = categoryTasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
            const catActual = categoryTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
            const catTotalCost = categoryTasks.reduce((sum, t) => sum + (t.actualCost > 0 ? t.actualCost : (t.estimatedCost || 0)), 0);
            const catCompletedCount = categoryTasks.filter(t => t.status === 'COMPLETED').length;

            return (
              <div key={catKey} className="bg-white border border-[#EBE3DC] overflow-hidden">
                {/* Category Header */}
                <div className="bg-[#FCFAF7] p-4 sm:p-5 border-b border-[#EBE3DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-[#2D2926]" />
                    <h3 className="font-serif italic text-xl text-[#2D2926] flex items-center gap-2">
                      <span>{label}</span>
                      <span className="font-mono text-xs not-italic text-[#2D2926]/50 bg-[#EBE3DC] px-2 py-0.5">
                        {categoryTasks.length} mục
                      </span>
                    </h3>

                    {/* Edit Category Name Button */}
                    {onEditCategoryName && (
                      <button
                        onClick={() => onEditCategoryName(catKey, label)}
                        className="p-1 hover:bg-[#EBE3DC] text-[#2D2926]/60 hover:text-[#2D2926] transition-colors"
                        title="Đổi tên danh mục này"
                      >
                        <FolderEdit className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete Category Button */}
                    {onDeleteCategory && (
                      <button
                        onClick={() => {
                          if (categoryTasks.length > 0) {
                            if (!confirm(`Danh mục "${label}" đang có ${categoryTasks.length} công việc. Bạn có chắc chắn muốn xóa danh mục này khỏi danh sách tùy chỉnh?`)) {
                              return;
                            }
                          } else {
                            if (!confirm(`Xóa danh mục "${label}"?`)) return;
                          }
                          onDeleteCategory(catKey);
                        }}
                        className="p-1 hover:bg-rose-100 text-rose-700/60 hover:text-rose-800 transition-colors"
                        title="Xóa danh mục này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Category Cost Summary */}
                    <div className="text-right text-xs font-mono">
                      <span className="text-[#2D2926]/60 uppercase text-[9px] tracking-wider block">Tổng chi phí:</span>
                      <span className="font-bold text-[#2D2926]">
                        {formatVND(catTotalCost)}
                      </span>
                    </div>

                    {/* Add Task directly to this category */}
                    <button
                      onClick={() => onOpenAddTask(catKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#2D2926] hover:bg-[#2D2926] hover:text-white text-[#2D2926] text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm mục</span>
                    </button>
                  </div>
                </div>

                {/* Category Items List */}
                <div className="divide-y divide-[#EBE3DC]">
                  {categoryTasks.length === 0 ? (
                    <div className="p-6 text-center text-[#2D2926]/40 italic text-xs">
                      Chưa có công việc nào trong danh mục này.{' '}
                      <button
                        onClick={() => onOpenAddTask(catKey)}
                        className="underline font-semibold not-italic text-[#2D2926] ml-1 hover:text-black"
                      >
                        + Thêm ngay
                      </button>
                    </div>
                  ) : (
                    categoryTasks.map((task) => {
                      const statusInfo = TASK_STATUS_LABELS[task.status];
                      const costToUse = task.actualCost > 0 ? task.actualCost : task.estimatedCost;
                      const remainingPayable = Math.max(0, costToUse - (task.depositPaid || 0));

                      return (
                        <div 
                          key={task.id} 
                          className={`p-4 sm:p-5 hover:bg-[#FCFAF7] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            task.status === 'COMPLETED' ? 'bg-[#FCFAF7]/50' : 'bg-white'
                          }`}
                        >
                          {/* Left Column: Status Toggle & Details */}
                          <div className="flex items-start gap-3.5 flex-1">
                            <button
                              onClick={() => onToggleTaskStatus(task.id)}
                              className={`mt-1 p-1 transition-colors ${
                                task.status === 'COMPLETED'
                                  ? 'text-[#2D2926]'
                                  : task.status === 'IN_PROGRESS'
                                  ? 'text-[#D4C3B5]'
                                  : 'text-[#D4C3B5]/50 hover:text-[#2D2926]'
                              }`}
                              title="Bấm để đổi trạng thái"
                            >
                              {task.status === 'COMPLETED' ? (
                                <CheckCircle2 className="w-5 h-5 fill-[#2D2926] text-[#FCFAF7]" />
                              ) : task.status === 'IN_PROGRESS' ? (
                                <Clock className="w-5 h-5 animate-spin-slow" />
                              ) : (
                                <div className="w-5 h-5 border border-[#2D2926] hover:bg-[#2D2926]" />
                              )}
                            </button>

                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-[#EBE3DC] bg-[#FCFAF7] text-[#2D2926]/70">
                                  {statusInfo.label}
                                </span>
                                {task.dueDate && (
                                  <span className="text-[11px] text-[#2D2926]/60 font-mono flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3 text-[#2D2926]" />
                                    <span>Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                                  </span>
                                )}
                              </div>

                              <h4 className={`font-semibold text-[#2D2926] text-sm leading-snug ${
                                task.status === 'COMPLETED' ? 'line-through text-[#2D2926]/40' : ''
                              }`}>
                                {task.title}
                              </h4>

                              {/* Vendor Contact */}
                              {task.vendorName && (
                                <p className="text-xs text-[#2D2926] font-medium flex items-center gap-1.5">
                                  <Building className="w-3.5 h-3.5 text-[#2D2926]/40" />
                                  <span>Đối tác: <strong>{task.vendorName}</strong></span>
                                  {task.vendorContact && (
                                    <span className="text-[#2D2926]/60 font-normal">({task.vendorContact})</span>
                                  )}
                                </p>
                              )}

                              {/* Notes */}
                              {task.notes && (
                                <p className="text-xs text-[#2D2926]/80 italic bg-[#FCFAF7] p-2 border border-[#EBE3DC] max-w-2xl">
                                  📝 {task.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Middle Column: Financial Metrics */}
                          <div className="bg-[#FCFAF7] p-2.5 border border-[#EBE3DC] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full md:w-auto text-right">
                            <div>
                              <span className="uppercase text-[9px] tracking-wider text-[#2D2926]/50 block">Dự toán:</span>
                              <span className="font-mono text-[#2D2926]">{formatVND(task.estimatedCost)}</span>
                            </div>
                            <div>
                              <span className="uppercase text-[9px] tracking-wider text-[#2D2926]/50 block">Thực chi:</span>
                              <span className="font-mono font-bold text-[#2D2926]">
                                {task.actualCost > 0 ? formatVND(task.actualCost) : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="uppercase text-[9px] tracking-wider text-[#2D2926]/50 block">Đã cọc/TT:</span>
                              <span className="font-mono text-[#2D2926]">{formatVND(task.depositPaid)}</span>
                            </div>
                            <div>
                              <span className="uppercase text-[9px] tracking-wider text-[#2D2926]/50 block">Còn trả:</span>
                              <span className="font-mono font-bold text-[#2D2926]">{formatVND(remainingPayable)}</span>
                            </div>
                          </div>

                          {/* Right Column: Edit / Delete Actions */}
                          <div className="flex items-center justify-end gap-1.5 border-t md:border-t-0 pt-2 md:pt-0 border-[#EBE3DC]">
                            <button
                              onClick={() => onEditTask(task)}
                              className="px-2.5 py-1.5 hover:bg-[#2D2926] hover:text-[#FCFAF7] text-[#2D2926] text-xs uppercase tracking-wider font-semibold transition-colors border border-[#EBE3DC] flex items-center gap-1"
                              title="Sửa nội dung"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1.5 hover:bg-red-700 hover:text-white text-[#2D2926]/70 transition-colors border border-[#EBE3DC]"
                              title="Xóa công việc"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* FLAT LIST VIEW */
        <div className="bg-white border border-[#EBE3DC] overflow-hidden divide-y divide-[#EBE3DC]">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-[#2D2926]/50 space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-serif italic">Không tìm thấy công việc nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const label = getCategoryLabel(task.category);
              const statusInfo = TASK_STATUS_LABELS[task.status];
              const costToUse = task.actualCost > 0 ? task.actualCost : task.estimatedCost;
              const remainingPayable = Math.max(0, costToUse - (task.depositPaid || 0));

              return (
                <div 
                  key={task.id} 
                  className={`p-5 hover:bg-[#FCFAF7] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    task.status === 'COMPLETED' ? 'bg-[#FCFAF7]/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      onClick={() => onToggleTaskStatus(task.id)}
                      className={`mt-1 p-1 transition-colors ${
                        task.status === 'COMPLETED'
                          ? 'text-[#2D2926]'
                          : task.status === 'IN_PROGRESS'
                          ? 'text-[#D4C3B5]'
                          : 'text-[#D4C3B5]/50 hover:text-[#2D2926]'
                      }`}
                    >
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-5 h-5 fill-[#2D2926] text-[#FCFAF7]" />
                      ) : (
                        <div className="w-5 h-5 border border-[#2D2926]" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] uppercase tracking-widest px-2.5 py-0.5 border border-[#D4C3B5] bg-[#F5F1EE] text-[#2D2926]">
                          {label}
                        </span>
                        <span className="text-[9px] uppercase tracking-widest px-2.5 py-0.5 border border-[#EBE3DC] bg-white text-[#2D2926]/70">
                          {statusInfo.label}
                        </span>
                      </div>

                      <h3 className="font-semibold text-[#2D2926] text-base leading-snug">
                        {task.title}
                      </h3>

                      {task.notes && (
                        <p className="text-xs text-[#2D2926]/80 italic bg-[#FCFAF7] p-2 border border-[#EBE3DC] max-w-2xl">
                          📝 {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditTask(task)}
                      className="px-3 py-1.5 bg-[#2D2926] text-[#FCFAF7] text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa nội dung</span>
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 hover:bg-red-700 hover:text-white text-[#2D2926] transition-colors border border-[#EBE3DC]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer Summary Row for Filtered Tasks */}
      <div className="bg-[#2D2926] text-[#FCFAF7] p-5 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#2D2926]">
        <div className="uppercase tracking-widest text-[11px] text-[#D4C3B5]">
          Hiển thị {filteredTasks.length} / {tasks.length} hạng mục công việc
        </div>
        <div className="flex flex-wrap items-center justify-end gap-5 text-right font-mono">
          <div>
            <span className="text-[#D4C3B5] uppercase text-[10px] tracking-wider">Tổng Dự Toán: </span>
            <span className="text-white">{formatVND(filteredTotalEstimated)}</span>
          </div>
          <div>
            <span className="text-[#D4C3B5] uppercase text-[10px] tracking-wider">Tổng Thực Chi: </span>
            <span className="text-white">{formatVND(filteredTotalActual)}</span>
          </div>
          <div>
            <span className="text-[#D4C3B5] uppercase text-[10px] tracking-wider">Tổng Đã Cọc / TT: </span>
            <span className="text-white">{formatVND(filteredTotalDeposit)}</span>
          </div>
          <div>
            <span className="text-[#D4C3B5] uppercase text-[10px] tracking-wider">Còn Phải Trả: </span>
            <span className="text-white font-serif italic text-base font-bold ml-1">{formatVND(filteredTotalRemaining)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
