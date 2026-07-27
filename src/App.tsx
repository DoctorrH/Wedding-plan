import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  TaskItem, 
  GuestItem, 
  WeddingDetails, 
  GuestRSVPStatus,
  TaskCategory,
  CATEGORY_LABELS
} from './types';
import { 
  initialWeddingDetails, 
  initialTasks, 
  initialGuests 
} from './data/initialData';
import { exportToJsonFile } from './lib/utils';
import {
  subscribeWeddingDetails,
  saveWeddingDetailsToDb,
  subscribeCategoryNames,
  saveCategoryNamesToDb,
  subscribeTasks,
  saveTaskToDb,
  deleteTaskFromDb,
  subscribeGuests,
  saveGuestToDb,
  deleteGuestFromDb,
  onAuthStateChanged,
  auth,
  User
} from './lib/firebase';

// UI Components
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { TaskListView } from './components/TaskListView';
import { GuestListView } from './components/GuestListView';

// Modals
import { TaskModal } from './components/TaskModal';
import { GuestModal } from './components/GuestModal';
import { EditCoupleModal } from './components/EditCoupleModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);
  // Main State (synced with Firebase Firestore)
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>(initialWeddingDetails);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [guests, setGuests] = useState<GuestItem[]>(initialGuests);
  const [categoryNames, setCategoryNames] = useState<Record<TaskCategory, string>>({
    LE_GIA_TIEN: CATEGORY_LABELS.LE_GIA_TIEN.label,
    TRANG_PHUC: CATEGORY_LABELS.TRANG_PHUC.label,
    TIEC_CUOI: CATEGORY_LABELS.TIEC_CUOI.label,
    CHUP_ANH: CATEGORY_LABELS.CHUP_ANH.label,
    THIEP_MOI: CATEGORY_LABELS.THIEP_MOI.label,
    NHAN_CUOI: CATEGORY_LABELS.NHAN_CUOI.label,
    XE_HOA_DECOR: CATEGORY_LABELS.XE_HOA_DECOR.label,
    KHAC: CATEGORY_LABELS.KHAC.label,
  });

  // Realtime Firebase Subscriptions (per account)
  useEffect(() => {
    const uid = currentUser?.uid;

    const unsubscribeDetails = subscribeWeddingDetails((details) => {
      setWeddingDetails(details);
    }, uid);

    const unsubscribeCategories = subscribeCategoryNames((names) => {
      setCategoryNames(names);
    }, uid);

    const unsubscribeTasks = subscribeTasks((taskList) => {
      setTasks(taskList);
    }, uid);

    const unsubscribeGuests = subscribeGuests((guestList) => {
      setGuests(guestList);
    }, uid);

    return () => {
      unsubscribeDetails();
      unsubscribeCategories();
      unsubscribeTasks();
      unsubscribeGuests();
    };
  }, [currentUser?.uid]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'tasks' | 'guests'>('dashboard');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskInitialDate, setTaskInitialDate] = useState<string | null>(null);
  const [taskInitialCategory, setTaskInitialCategory] = useState<TaskCategory | null>(null);

  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<GuestItem | null>(null);

  const [isEditCoupleModalOpen, setIsEditCoupleModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Edit Category Modal State
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editingCategoryKey, setEditingCategoryKey] = useState<TaskCategory | null>(null);
  const [editingCategoryCurrentName, setEditingCategoryCurrentName] = useState('');

  // Delete Confirmation Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // TASK HANDLERS
  const handleSaveTask = async (taskData: Omit<TaskItem, 'id'>, taskId?: string) => {
    try {
      await saveTaskToDb(taskData, taskId, currentUser?.uid);
    } catch (err) {
      console.error('Lỗi khi lưu công việc vào Firestore:', err);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    setConfirmModalConfig({
      isOpen: true,
      title: 'Xóa Công Việc',
      message: `Bạn có chắc chắn muốn xóa công việc "${target?.title || 'này'}" khỏi danh sách?`,
      onConfirm: async () => {
        try {
          await deleteTaskFromDb(taskId, currentUser?.uid);
        } catch (err) {
          console.error('Lỗi khi xóa công việc khỏi Firestore:', err);
        }
      },
    });
  };

  const handleToggleTaskStatus = async (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const nextStatus =
      targetTask.status === 'TODO'
        ? 'IN_PROGRESS'
        : targetTask.status === 'IN_PROGRESS'
        ? 'COMPLETED'
        : 'TODO';

    if (nextStatus === 'COMPLETED') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    const { id, ...rest } = targetTask;
    try {
      await saveTaskToDb({ ...rest, status: nextStatus }, taskId, currentUser?.uid);
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    }
  };

  // GUEST HANDLERS
  const handleSaveGuest = async (guestData: Omit<GuestItem, 'id'>, guestId?: string) => {
    try {
      await saveGuestToDb(guestData, guestId, currentUser?.uid);
    } catch (err) {
      console.error('Lỗi khi lưu khách mời vào Firestore:', err);
    }
  };

  const handleDeleteGuest = (guestId: string) => {
    const target = guests.find(g => g.id === guestId);
    setConfirmModalConfig({
      isOpen: true,
      title: 'Xóa Khách Mời',
      message: `Bạn có chắc chắn muốn xóa khách mời "${target?.name || 'này'}" khỏi danh sách?`,
      onConfirm: async () => {
        try {
          await deleteGuestFromDb(guestId, currentUser?.uid);
        } catch (err) {
          console.error('Lỗi khi xóa khách mời khỏi Firestore:', err);
        }
      },
    });
  };

  const handleQuickUpdateRSVP = async (guestId: string, rsvp: GuestRSVPStatus) => {
    const targetGuest = guests.find(g => g.id === guestId);
    if (!targetGuest) return;

    const { id, ...rest } = targetGuest;
    try {
      await saveGuestToDb({ ...rest, rsvp }, guestId, currentUser?.uid);
    } catch (err) {
      console.error('Lỗi khi cập nhật RSVP:', err);
    }
  };

  // WEDDING DETAILS & CATEGORIES HANDLERS
  const handleSaveWeddingDetails = async (details: WeddingDetails) => {
    try {
      await saveWeddingDetailsToDb(details, currentUser?.uid);
    } catch (err) {
      console.error('Lỗi khi lưu thông tin đám cưới:', err);
    }
  };

  const handleSaveCategoryName = async (catKey: TaskCategory, newName: string) => {
    const updated = {
      ...categoryNames,
      [catKey]: newName,
    };
    try {
      await saveCategoryNamesToDb(updated, currentUser?.uid);
    } catch (err) {
      console.error('Lỗi khi lưu tên danh mục:', err);
    }
  };

  // PRESET RESET & FILE IMPORT / EXPORT
  const handleResetData = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Đặt Lại Dữ Liệu Mẫu',
      message: 'Bạn có muốn khôi phục lại toàn bộ danh sách công việc và khách mời mẫu ban đầu? Dữ liệu hiện tại trên Firestore sẽ bị thay thế.',
      onConfirm: async () => {
        const uid = currentUser?.uid;
        await saveWeddingDetailsToDb(initialWeddingDetails, uid);
        for (const t of initialTasks) {
          const { id, ...rest } = t;
          await saveTaskToDb(rest, id, uid);
        }
        for (const g of initialGuests) {
          const { id, ...rest } = g;
          await saveGuestToDb(rest, id, uid);
        }
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5 },
        });
      },
    });
  };

  const handleExportData = () => {
    const exportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      weddingDetails,
      tasks,
      guests,
    };
    exportToJsonFile(exportPayload, `Ke-hoach-cuoi-${weddingDetails.groomName}-${weddingDetails.brideName}.json`);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.weddingDetails) await saveWeddingDetailsToDb(json.weddingDetails);
        if (json.tasks && Array.isArray(json.tasks)) {
          for (const t of json.tasks) {
            const { id, ...rest } = t;
            await saveTaskToDb(rest, id);
          }
        }
        if (json.guests && Array.isArray(json.guests)) {
          for (const g of json.guests) {
            const { id, ...rest } = g;
            await saveGuestToDb(rest, id);
          }
        }
        alert('Đã nhập thành công dữ liệu kế hoạch đám cưới vào Firebase Firestore!');
      } catch (err) {
        alert('File JSON không hợp lệ, vui lòng kiểm tra lại!');
      }
    };
    reader.readAsText(file);
  };

  // Pending tasks & attending guests counts
  const pendingTasksCount = tasks.filter(t => t.status !== 'COMPLETED').length;
  const attendingGuestsCount = guests.filter(g => g.rsvp === 'ATTENDING').length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] text-[#1A1816] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-[#1A1816] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="font-serif italic font-bold text-2xl text-[#1A1816]">Sổ Tay Kế Hoạch Cưới</h2>
        <p className="text-xs uppercase tracking-widest text-[#786F68] mt-1.5 font-bold">
          Đang kết nối tài khoản dữ liệu...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-rose-200 selection:text-rose-900">
      {/* Top Navbar Header */}
      <Navbar
        weddingDetails={weddingDetails}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEditCouple={() => setIsEditCoupleModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
        pendingTasksCount={pendingTasksCount}
        attendingGuestsCount={attendingGuestsCount}
      />

      {/* Main Body View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            guests={guests}
            weddingDetails={weddingDetails}
            categoryNames={categoryNames}
            onOpenAddTask={() => {
              setTaskToEdit(null);
              setTaskInitialDate(null);
              setTaskInitialCategory(null);
              setIsTaskModalOpen(true);
            }}
            onOpenAddGuest={() => {
              setGuestToEdit(null);
              setIsGuestModalOpen(true);
            }}
            onSwitchTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            weddingDate={weddingDetails.weddingDate}
            onOpenAddTaskWithDate={(dateStr) => {
              setTaskToEdit(null);
              setTaskInitialDate(dateStr);
              setTaskInitialCategory(null);
              setIsTaskModalOpen(true);
            }}
            onToggleTaskStatus={handleToggleTaskStatus}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskListView
            tasks={tasks}
            categoryNames={categoryNames}
            onOpenAddTask={(defaultCategory) => {
              setTaskToEdit(null);
              setTaskInitialDate(null);
              setTaskInitialCategory(defaultCategory || null);
              setIsTaskModalOpen(true);
            }}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onToggleTaskStatus={handleToggleTaskStatus}
            onEditCategoryName={(categoryKey, currentName) => {
              setEditingCategoryKey(categoryKey);
              setEditingCategoryCurrentName(currentName);
              setIsEditCategoryModalOpen(true);
            }}
          />
        )}

        {activeTab === 'guests' && (
          <GuestListView
            guests={guests}
            onOpenAddGuest={() => {
              setGuestToEdit(null);
              setIsGuestModalOpen(true);
            }}
            onEditGuest={(guest) => {
              setGuestToEdit(guest);
              setIsGuestModalOpen(true);
            }}
            onDeleteGuest={handleDeleteGuest}
            onQuickUpdateRSVP={handleQuickUpdateRSVP}
          />
        )}
      </main>

      {/* MODALS */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
          setTaskInitialDate(null);
          setTaskInitialCategory(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialDate={taskInitialDate}
        initialCategory={taskInitialCategory}
        categoryNames={categoryNames}
      />

      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setEditingCategoryKey(null);
        }}
        categoryKey={editingCategoryKey}
        currentName={editingCategoryCurrentName}
        onSave={(catKey, newName) => handleSaveCategoryName(catKey, newName)}
      />

      <GuestModal
        isOpen={isGuestModalOpen}
        onClose={() => {
          setIsGuestModalOpen(false);
          setGuestToEdit(null);
        }}
        onSave={handleSaveGuest}
        guestToEdit={guestToEdit}
      />

      <EditCoupleModal
        isOpen={isEditCoupleModalOpen}
        onClose={() => setIsEditCoupleModalOpen(false)}
        onSave={(details) => handleSaveWeddingDetails(details)}
        weddingDetails={weddingDetails}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        weddingDetails={weddingDetails}
      />

      <ConfirmDeleteModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
