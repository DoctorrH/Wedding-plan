import * as XLSX from 'xlsx';
import { 
  TaskItem, 
  GuestItem, 
  WeddingDetails, 
  CATEGORY_LABELS, 
  TASK_STATUS_LABELS, 
  GUEST_GROUP_LABELS, 
  TaskCategory 
} from '../types';

export function exportTasksToExcel(
  tasks: TaskItem[],
  weddingDetails: WeddingDetails,
  categoryNames?: Record<TaskCategory, string>
) {
  const title = `KẾ HOẠCH CÔNG VIỆC & NGÂN SÁCH ĐÁM CƯỚI - ${weddingDetails.groomName || 'Minh Đức'} & ${weddingDetails.brideName || 'Thu Trang'}`;
  const dateStr = weddingDetails.weddingDate ? new Date(weddingDetails.weddingDate).toLocaleDateString('vi-VN') : 'Chưa đặt ngày';
  const venueStr = weddingDetails.venue || 'Chưa chọn địa điểm';

  // Table rows array of arrays (AOA)
  const data: any[][] = [
    [title],
    [`Ngày cưới: ${dateStr} | Địa điểm: ${venueStr}`],
    [], // empty row separator
    [
      'STT',
      'Tên Công Việc',
      'Danh Mục',
      'Trạng Thái',
      'Hạn Chót',
      'Đối Tác / Đơn Vị',
      'SĐT Đối Tác',
      'Chi Phí Dự Toán (VNĐ)',
      'Chi Phí Thực Chi (VNĐ)',
      'Tiền Đã Cọc (VNĐ)',
      'Còn Phải Trả (VNĐ)',
      'Ghi Chú'
    ]
  ];

  let sumEstimated = 0;
  let sumActual = 0;
  let sumDeposit = 0;
  let sumRemaining = 0;

  tasks.forEach((t, idx) => {
    const catLabel = categoryNames?.[t.category] || CATEGORY_LABELS[t.category]?.label || t.category;
    const statusLabel = TASK_STATUS_LABELS[t.status]?.label || t.status;
    const dueDateStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString('vi-VN') : '-';
    
    const est = t.estimatedCost || 0;
    const act = t.actualCost || 0;
    const dep = t.depositPaid || 0;
    const costToUse = act > 0 ? act : est;
    const rem = Math.max(0, costToUse - dep);

    sumEstimated += est;
    sumActual += act;
    sumDeposit += dep;
    sumRemaining += rem;

    data.push([
      idx + 1,
      t.title,
      catLabel,
      statusLabel,
      dueDateStr,
      t.vendorName || '-',
      t.vendorContact || '-',
      est,
      act,
      dep,
      rem,
      t.notes || ''
    ]);
  });

  // Add Summary Total Row
  data.push([]);
  data.push([
    'TỔNG CỘNG',
    `${tasks.length} mục công việc`,
    '',
    '',
    '',
    '',
    '',
    sumEstimated,
    sumActual,
    sumDeposit,
    sumRemaining,
    ''
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths for beautiful layout
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 32 }, // Tên công việc
    { wch: 22 }, // Danh mục
    { wch: 16 }, // Trạng thái
    { wch: 14 }, // Hạn chót
    { wch: 22 }, // Đối tác
    { wch: 16 }, // SĐT đối tác
    { wch: 20 }, // Dự toán
    { wch: 20 }, // Thực chi
    { wch: 18 }, // Đã cọc
    { wch: 18 }, // Còn trả
    { wch: 35 }  // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CongViec_NganSach');

  const fileName = `Ke_Hoach_Cong_Viec_${weddingDetails.groomName || 'MinhDuc'}_${weddingDetails.brideName || 'ThuTrang'}.xlsx`
    .replace(/\s+/g, '_');
    
  XLSX.writeFile(workbook, fileName);
}

export function exportGuestsToExcel(
  guests: GuestItem[],
  weddingDetails: WeddingDetails
) {
  const title = `DANH SÁCH KHÁCH MỜI ĐÁM CƯỚI - ${weddingDetails.groomName || 'Minh Đức'} & ${weddingDetails.brideName || 'Thu Trang'}`;
  const dateStr = weddingDetails.weddingDate ? new Date(weddingDetails.weddingDate).toLocaleDateString('vi-VN') : 'Chưa đặt ngày';

  const data: any[][] = [
    [title],
    [`Ngày cưới: ${dateStr} | Tổng thiệp mời: ${guests.length}`],
    [], // empty row separator
    [
      'STT',
      'Họ Và Tên Khách Mời',
      'Nhóm Khách',
      'Số Điện Thoại',
      'Địa Chỉ',
      'Trạng Thái RSVP',
      'Người Đi Kèm (+)',
      'Tổng Số Suất Ăn',
      'Bàn Tiệc',
      'Ghi Chú'
    ]
  ];

  let totalAttendingCards = 0;
  let totalHeadcount = 0;

  guests.forEach((g, idx) => {
    const groupLabel = GUEST_GROUP_LABELS[g.group] || g.group;
    let rsvpText = 'Chờ xác nhận';
    if (g.rsvp === 'ATTENDING') {
      rsvpText = 'Chắc chắn tham gia';
      totalAttendingCards += 1;
      totalHeadcount += (1 + (g.plusOnes || 0));
    } else if (g.rsvp === 'MAYBE') {
      rsvpText = 'Có thể tham gia';
    } else if (g.rsvp === 'DECLINED') {
      rsvpText = 'Không tham gia';
    }

    const headcount = 1 + (g.plusOnes || 0);

    data.push([
      idx + 1,
      g.name,
      groupLabel,
      g.phone || '-',
      g.address || '-',
      rsvpText,
      g.plusOnes || 0,
      headcount,
      g.tableNumber || '-',
      g.notes || ''
    ]);
  });

  // Total Row
  data.push([]);
  data.push([
    'TỔNG CỘNG',
    `${guests.length} Thiệp`,
    '',
    '',
    '',
    `Tham dự: ${totalAttendingCards} thiệp`,
    '',
    `Tổng: ${totalHeadcount} suất ăn`,
    '',
    ''
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 26 }, // Họ tên
    { wch: 20 }, // Nhóm
    { wch: 16 }, // SĐT
    { wch: 30 }, // Địa chỉ
    { wch: 22 }, // RSVP
    { wch: 14 }, // Đi kèm
    { wch: 16 }, // Tổng suất
    { wch: 14 }, // Bàn tiệc
    { wch: 35 }  // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachKhachMoi');

  const fileName = `Danh_Sach_Khach_Moi_${weddingDetails.groomName || 'MinhDuc'}_${weddingDetails.brideName || 'ThuTrang'}.xlsx`
    .replace(/\s+/g, '_');

  XLSX.writeFile(workbook, fileName);
}
