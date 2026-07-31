import React from 'react';
import { 
  Heart, 
  Calendar, 
  CheckSquare, 
  Users, 
  LayoutDashboard, 
  Sparkles, 
  RotateCcw, 
  FileSpreadsheet,
  Settings,
  Printer,
  User as UserIcon,
  LogOut,
  LogIn,
  Share2
} from 'lucide-react';
import { WeddingDetails } from '../types';
import { getDaysRemaining } from '../lib/utils';
import { User, signOutUser } from '../lib/firebase';

interface NavbarProps {
  weddingDetails: WeddingDetails;
  activeTab: 'dashboard' | 'calendar' | 'tasks' | 'guests';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'tasks' | 'guests') => void;
  onOpenEditCouple: () => void;
  onOpenAiAssistant: () => void;
  onOpenShareModal: () => void;
  onOpenAuth: () => void;
  currentUser: User | null;
  onResetData: () => void;
  onExportTasksExcel: () => void;
  onExportGuestsExcel: () => void;
  pendingTasksCount: number;
  attendingGuestsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  weddingDetails,
  activeTab,
  setActiveTab,
  onOpenEditCouple,
  onOpenAiAssistant,
  onOpenShareModal,
  onOpenAuth,
  currentUser,
  onResetData,
  onExportTasksExcel,
  onExportGuestsExcel,
  pendingTasksCount,
  attendingGuestsCount,
}) => {
  const countdown = getDaysRemaining(weddingDetails.weddingDate);

  const isAnonymous = currentUser?.isAnonymous ?? true;

  return (
    <header className="bg-[#FCFAF7] border-b border-[#D4C3B5] sticky top-0 z-30">
      {/* Editorial Header Section */}
      <div className="border-b border-[#EBE3DC] px-4 py-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[#2D2926]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#2D2926] text-[#FCFAF7] rounded-full shadow-xs">
              <Heart className="w-5 h-5 fill-[#FCFAF7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-serif italic font-semibold tracking-tight text-[#1A1816]">
                  Lễ Cưới Của {weddingDetails.groomName || 'Minh Đức'} & {weddingDetails.brideName || 'Thu Trang'}
                </h1>
                <button
                  onClick={onOpenEditCouple}
                  title="Chỉnh sửa thông tin ngày cưới"
                  className="p-1 hover:bg-[#EBE3DC] text-[#1A1816] rounded-md transition-colors"
                  id="btn-edit-couple-info"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="uppercase text-[11px] font-semibold tracking-[0.2em] text-[#2D2926]">
                  {weddingDetails.weddingDate ? new Date(weddingDetails.weddingDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Chưa đặt ngày'}
                  {weddingDetails.venue && ` • ${weddingDetails.venue}`}
                </p>

              </div>
            </div>
          </div>

          {/* Countdown & Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="text-right px-3 py-1 border-r border-[#D4C3B5]">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1816] leading-none">
                {countdown.days}
              </div>
              <div className="uppercase text-[10px] font-bold tracking-widest text-[#2D2926] mt-0.5">
                {countdown.isPassed ? 'Ngày đã qua' : 'Ngày còn lại'}
              </div>
            </div>

            {/* User Auth Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-white border border-[#DCD3CC] p-1.5 pl-2.5 shadow-2xs">
                <div className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold font-mono ${currentUser.isAnonymous ? 'bg-[#786F68]' : 'bg-[#1A1816]'}`}>
                  {currentUser.isAnonymous ? 'K' : currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-bold text-[#1A1816] truncate max-w-[130px]">
                    {currentUser.isAnonymous ? 'Tài Khoản Khách' : (currentUser.displayName || currentUser.email?.split('@')[0])}
                  </div>
                  <div className="text-[9px] text-emerald-800 font-mono font-semibold">
                    {currentUser.isAnonymous ? 'Tạm thời' : 'Đã đăng nhập'}
                  </div>
                </div>
                <button
                  onClick={() => signOutUser()}
                  className="p-1 hover:bg-[#F3EEEA] text-[#1A1816] transition-colors ml-1 font-semibold text-xs flex items-center gap-1"
                  title="Đăng xuất khỏi tài khoản"
                  id="btn-signout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[10px] uppercase tracking-wider font-bold">Thoát</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#1A1816] text-[#1A1816] text-xs uppercase tracking-wider font-bold hover:bg-[#1A1816] hover:text-[#FCFAF7] transition-colors shadow-2xs"
                title="Đăng nhập hoặc Đăng ký tài khoản"
                id="btn-login-screen"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}

            {/* Share / Copy Data Code Button */}
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2D2926] text-white text-xs uppercase tracking-wider font-bold hover:bg-[#423D38] transition-colors shadow-2xs"
              title="Sao chép hoặc nhập dữ liệu giữa các tài khoản qua mã ngẫu nhiên"
              id="btn-open-share-modal"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D4C3B5]" />
              <span>Mã Sao Chép</span>
            </button>

            {/* Excel Export & Reset actions */}
            <div className="hidden md:flex items-center gap-1 border border-[#D4C3B5] bg-white p-1">
              <button
                onClick={onExportTasksExcel}
                className="p-1.5 hover:bg-[#F5F1EE] text-[#2D2926] transition-colors text-xs flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold"
                title="Xuất file Excel công việc & ngân sách"
                id="btn-export-tasks-excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
                <span>Excel Công Việc</span>
              </button>
              <button
                onClick={onExportGuestsExcel}
                className="p-1.5 hover:bg-[#F5F1EE] text-[#2D2926] transition-colors text-xs flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold"
                title="Xuất file Excel danh sách khách mời"
                id="btn-export-guests-excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
                <span>Excel Khách Mời</span>
              </button>
              <button
                onClick={onResetData}
                className="p-1.5 hover:bg-[#F5F1EE] text-[#2D2926] transition-colors text-xs flex items-center gap-1 uppercase tracking-wider text-[10px]"
                title="Đặt lại dữ liệu mẫu chuẩn"
                id="btn-reset-preset-data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mẫu</span>
              </button>
              <button
                onClick={() => window.print()}
                className="p-1.5 hover:bg-[#F5F1EE] text-[#2D2926] transition-colors text-xs flex items-center gap-1 uppercase tracking-wider text-[10px]"
                title="In trang này"
                id="btn-print-page"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs - Editorial Style */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto py-3 scrollbar-none" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-2 px-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-[#1A1816] text-[#1A1816]'
                : 'border-transparent text-[#423D38] hover:text-[#1A1816] hover:border-[#D4C3B5]'
            }`}
            id="tab-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tổng Quan & Ngân Sách</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 py-2 px-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-[#1A1816] text-[#1A1816]'
                : 'border-transparent text-[#423D38] hover:text-[#1A1816] hover:border-[#D4C3B5]'
            }`}
            id="tab-calendar"
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch Theo Tháng</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 py-2 px-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-[#1A1816] text-[#1A1816]'
                : 'border-transparent text-[#423D38] hover:text-[#1A1816] hover:border-[#D4C3B5]'
            }`}
            id="tab-tasks"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Công Việc</span>
            {pendingTasksCount > 0 && (
              <span className={`ml-1 text-[11px] font-bold px-1.5 py-0.2 border ${
                activeTab === 'tasks' ? 'bg-[#1A1816] text-white border-[#1A1816]' : 'bg-[#F5F1EE] text-[#1A1816] border-[#D4C3B5]'
              }`}>
                {pendingTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-2 py-2 px-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'guests'
                ? 'border-[#1A1816] text-[#1A1816]'
                : 'border-transparent text-[#423D38] hover:text-[#1A1816] hover:border-[#D4C3B5]'
            }`}
            id="tab-guests"
          >
            <Users className="w-4 h-4" />
            <span>Khách Mời</span>
            {attendingGuestsCount > 0 && (
              <span className={`ml-1 text-[11px] font-bold px-1.5 py-0.2 border ${
                activeTab === 'guests' ? 'bg-[#1A1816] text-white border-[#1A1816]' : 'bg-[#F5F1EE] text-[#1A1816] border-[#D4C3B5]'
              }`}>
                {attendingGuestsCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
