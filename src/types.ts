export type TaskCategory =
  | 'LE_GIA_TIEN'
  | 'TRANG_PHUC'
  | 'TIEC_CUOI'
  | 'CHUP_ANH'
  | 'THIEP_MOI'
  | 'NHAN_CUOI'
  | 'XE_HOA_DECOR'
  | 'KHAC';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface TaskItem {
  id: string;
  title: string;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  targetMonth: string; // YYYY-MM
  status: TaskStatus;
  estimatedCost: number; // VNĐ
  actualCost: number; // VNĐ
  depositPaid: number; // VNĐ
  vendorName?: string;
  vendorContact?: string;
  notes: string;
}

export type GuestRSVPStatus = 'ATTENDING' | 'MAYBE' | 'DECLINED' | 'PENDING';

export type GuestGroup =
  | 'GROOM_FAMILY'
  | 'BRIDE_FAMILY'
  | 'MUTUAL_FRIENDS'
  | 'COLLEAGUES'
  | 'VIP';

export interface GuestItem {
  id: string;
  name: string;
  group: GuestGroup;
  phone: string;
  address: string;
  rsvp: GuestRSVPStatus;
  plusOnes: number; // Số người đi kèm
  tableNumber?: string;
  notes: string;
}

export interface WeddingDetails {
  groomName: string;
  brideName: string;
  weddingDate: string; // YYYY-MM-DD
  venue: string;
  totalBudgetLimit: number; // Hạn mức ngân sách tổng
  tableCapacity?: number; // Số người / bàn tiệc (Mặc định: 10)
  notes: string;
}

export const CATEGORY_LABELS: Record<TaskCategory, { label: string; icon: string; color: string }> = {
  LE_GIA_TIEN: { label: 'Lễ Dặm Ngõ & Gia Tiên', icon: 'HeartHandshake', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  TRANG_PHUC: { label: 'Trang Phục & Make-up', icon: 'Shirt', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  TIEC_CUOI: { label: 'Nhà Hàng & Tiệc Cưới', icon: 'Utensils', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  CHUP_ANH: { label: 'Chụp Ảnh & Quay Phim', icon: 'Camera', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  THIEP_MOI: { label: 'Thiệp Mời & Quà Tặng', icon: 'Mail', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  NHAN_CUOI: { label: 'Nhẫn Cưới & Trang Sức', icon: 'Gem', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  XE_HOA_DECOR: { label: 'Xe Hoa & Trang Trí', icon: 'Flower2', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  KHAC: { label: 'Hạng Mục Khác', icon: 'MoreHorizontal', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const TASK_STATUS_LABELS: Record<TaskStatus, { label: string; badgeClass: string }> = {
  TODO: { label: 'Chưa bắt đầu', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  IN_PROGRESS: { label: 'Đang thực hiện', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  COMPLETED: { label: 'Hoàn thành', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export const RSVP_STATUS_LABELS: Record<GuestRSVPStatus, { label: string; badgeClass: string; colorHex: string }> = {
  ATTENDING: { label: 'Chắc chắn tham gia', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', colorHex: '#10b981' },
  MAYBE: { label: 'Có thể tham gia', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', colorHex: '#f59e0b' },
  DECLINED: { label: 'Không tham gia', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300', colorHex: '#f43f5e' },
  PENDING: { label: 'Chờ xác nhận', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300', colorHex: '#64748b' },
};

export const GUEST_GROUP_LABELS: Record<GuestGroup, string> = {
  GROOM_FAMILY: 'Họ nhà trai',
  BRIDE_FAMILY: 'Họ nhà gái',
  MUTUAL_FRIENDS: 'Bạn chung',
  COLLEAGUES: 'Đồng nghiệp',
  VIP: 'Khách VIP / Họ hàng',
};
