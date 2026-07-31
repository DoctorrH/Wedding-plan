import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, Users } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'calendar' | 'tasks' | 'guests';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'tasks' | 'guests') => void;
  pendingTasksCount: number;
  attendingGuestsCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingTasksCount,
  attendingGuestsCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FCFAF7] border-t border-[#D4C3B5] z-40 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex justify-around items-center h-16 px-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-[#1A1816]' : 'text-[#786F68] hover:text-[#423D38]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Tổng quan</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
            activeTab === 'calendar' ? 'text-[#1A1816]' : 'text-[#786F68] hover:text-[#423D38]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Lịch</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
            activeTab === 'tasks' ? 'text-[#1A1816]' : 'text-[#786F68] hover:text-[#423D38]'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#1A1816] text-[#FCFAF7] text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center border border-[#FCFAF7] leading-none">
                {pendingTasksCount > 99 ? '99+' : pendingTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">Việc</span>
        </button>

        <button
          onClick={() => setActiveTab('guests')}
          className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
            activeTab === 'guests' ? 'text-[#1A1816]' : 'text-[#786F68] hover:text-[#423D38]'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {attendingGuestsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#1A1816] text-[#FCFAF7] text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center border border-[#FCFAF7] leading-none">
                {attendingGuestsCount > 99 ? '99+' : attendingGuestsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">Khách</span>
        </button>
      </nav>
    </div>
  );
};
