import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  HelpCircle, 
  Clock, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  FileText, 
  FileSpreadsheet,
  Edit3, 
  Trash2, 
  Filter,
  PieChart as PieIcon,
  UtensilsCrossed,
  Sparkles,
  MailCheck,
  Send,
  CheckSquare,
  Square,
  Mail
} from 'lucide-react';
import { 
  GuestItem, 
  GuestGroup, 
  GuestRSVPStatus, 
  RSVP_STATUS_LABELS, 
  GUEST_GROUP_LABELS,
  PRIMARY_GUEST_GROUPS,
  WeddingDetails 
} from '../types';

interface GuestListViewProps {
  guests: GuestItem[];
  weddingDetails?: WeddingDetails;
  onUpdateWeddingDetails?: (details: WeddingDetails) => void;
  onOpenAddGuest: () => void;
  onEditGuest: (guest: GuestItem) => void;
  onDeleteGuest: (guestId: string) => void;
  onQuickUpdateRSVP: (guestId: string, rsvp: GuestRSVPStatus) => void;
  onQuickToggleInvited?: (guestId: string, isInvited: boolean) => void;
  onExportExcel?: () => void;
}

export const GuestListView: React.FC<GuestListViewProps> = ({
  guests,
  weddingDetails,
  onUpdateWeddingDetails,
  onOpenAddGuest,
  onEditGuest,
  onDeleteGuest,
  onQuickUpdateRSVP,
  onQuickToggleInvited,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedInvited, setSelectedInvited] = useState<string>('ALL');
  const [selectedRsvp, setSelectedRsvp] = useState<string>('ALL');
  const [localTableCapacity, setLocalTableCapacity] = useState<number>(10);

  const tableCapacity = weddingDetails?.tableCapacity || localTableCapacity;

  const handleTableCapacityChange = (newCapacity: number) => {
    setLocalTableCapacity(newCapacity);
    if (weddingDetails && onUpdateWeddingDetails) {
      onUpdateWeddingDetails({ ...weddingDetails, tableCapacity: newCapacity });
    }
  };

  // Statistics Calculations
  const totalGuests = guests.length;
  const invitedList = guests.filter(g => g.isInvited);
  const uninvitedList = guests.filter(g => !g.isInvited);
  const invitedCount = invitedList.length;
  const uninvitedCount = uninvitedList.length;
  const invitedPercentage = totalGuests > 0 ? Math.round((invitedCount / totalGuests) * 100) : 0;

  const attendingList = guests.filter(g => g.rsvp === 'ATTENDING');
  const maybeList = guests.filter(g => g.rsvp === 'MAYBE');
  const declinedList = guests.filter(g => g.rsvp === 'DECLINED');
  const pendingList = guests.filter(g => g.rsvp === 'PENDING');

  const attendingCount = attendingList.length;
  const maybeCount = maybeList.length;
  const declinedCount = declinedList.length;
  const pendingCount = pendingList.length;

  const attendingPlusOnes = attendingList.reduce((sum, g) => sum + (g.plusOnes || 0), 0);
  const totalAttendingHeadcount = attendingCount + attendingPlusOnes;

  // Maybe headcount estimation (assume 50% probability)
  const maybePlusOnes = maybeList.reduce((sum, g) => sum + (g.plusOnes || 0), 0);
  const totalMaybeHeadcount = maybeCount + maybePlusOnes;
  
  const estimatedHeadcountTotal = totalAttendingHeadcount + Math.round(totalMaybeHeadcount * 0.5);
  const estimatedTablesTotal = Math.ceil(estimatedHeadcountTotal / tableCapacity);

  // Filter Logic
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm) ||
      guest.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGroup = selectedGroup === 'ALL' || guest.group === selectedGroup;
    const matchesInvited = 
      selectedInvited === 'ALL' ||
      (selectedInvited === 'INVITED' && !!guest.isInvited) ||
      (selectedInvited === 'UNINVITED' && !guest.isInvited);
    const matchesRsvp = selectedRsvp === 'ALL' || guest.rsvp === selectedRsvp;

    return matchesSearch && matchesGroup && matchesInvited && matchesRsvp;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* DETAILED GUEST STATISTICS PANEL - Editorial Style */}
      <div className="bg-white p-6 border border-[#EBE3DC] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DC] pb-4">
          <div>
            <h2 className="text-2xl font-serif italic font-bold text-[#1A1816] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1A1816]" />
              <span>Quản Lý Khách Mời & Tiến Độ Mời Cưới</span>
            </h2>
            <p className="uppercase text-[11px] font-bold tracking-[0.18em] text-[#1A1816] mt-1">
              Phân tách khách dự kiến mời & khách đã gửi thiệp, kiểm soát phản hồi RSVP và bàn tiệc
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenAddGuest}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2D2926] text-[#FCFAF7] font-semibold text-xs uppercase tracking-wider transition-colors hover:bg-black"
              id="btn-add-guest-top"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Khách Mới</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 1: Tổng Danh Sách Dự Kiến */}
          <div className="bg-[#FCFAF7] p-4 border border-[#EBE3DC]">
            <div className="uppercase text-[9px] tracking-widest text-[#2D2926]/60">DỰ KIẾN MỜI</div>
            <div className="text-2xl font-serif text-[#2D2926] mt-1">{totalGuests}</div>
            <div className="text-[11px] text-[#2D2926]/60 mt-1 font-mono">
              Tổng danh sách dự kiến
            </div>
          </div>

          {/* Card 2: Đã Mời / Đã Gửi Thiệp */}
          <div className="bg-[#FCFAF7] p-4 border border-emerald-300 bg-emerald-50/30">
            <div className="flex items-center justify-between">
              <span className="uppercase text-[9px] tracking-widest text-emerald-800 font-bold">ĐÃ GỬI THIỆP / ĐÃ MỜI</span>
              <MailCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-serif text-emerald-900 mt-1">
              {invitedCount} <span className="text-xs font-mono font-normal text-emerald-700/80">({invitedPercentage}%)</span>
            </div>
            <div className="text-[11px] text-emerald-800/80 mt-1 font-mono">
              Đã gửi lời mời chính thức
            </div>
          </div>

          {/* Card 3: Chưa Mời (Dự Kiến) */}
          <div className="bg-[#FCFAF7] p-4 border border-[#EBE3DC]">
            <div className="flex items-center justify-between">
              <span className="uppercase text-[9px] tracking-widest text-[#2D2926] font-bold">CHƯA MỜI (DỰ KIẾN)</span>
              <Clock className="w-4 h-4 text-[#2D2926]/50" />
            </div>
            <div className="text-2xl font-serif text-[#2D2926] mt-1">
              {uninvitedCount} <span className="text-xs font-mono font-normal text-[#2D2926]/60">({100 - invitedPercentage}%)</span>
            </div>
            <div className="text-[11px] text-[#2D2926]/70 mt-1">
              Cần chuẩn bị gửi thiệp
            </div>
          </div>

          {/* Card 4: Chắc Chắn Tham Gia */}
          <div className="bg-[#FCFAF7] p-4 border border-[#EBE3DC]">
            <div className="flex items-center justify-between">
              <span className="uppercase text-[9px] tracking-widest text-[#2D2926] font-bold">CHẮC CHẮN ĐI</span>
              <UserCheck className="w-4 h-4 text-[#2D2926]" />
            </div>
            <div className="text-2xl font-serif text-[#2D2926] mt-1">
              {attendingCount} <span className="text-xs font-mono font-normal text-[#2D2926]/60">({totalGuests > 0 ? Math.round((attendingCount / totalGuests) * 100) : 0}%)</span>
            </div>
            <div className="text-[11px] text-[#2D2926]/70 mt-1 font-mono">
              +{attendingPlusOnes} đi kèm = {totalAttendingHeadcount} suất
            </div>
          </div>

          {/* Card 5: Có Thể & Chờ Phản Hồi */}
          <div className="bg-[#FCFAF7] p-4 border border-[#EBE3DC]">
            <div className="flex items-center justify-between">
              <span className="uppercase text-[9px] tracking-widest text-[#2D2926] font-bold">CHƯA CHỐT RSVP</span>
              <HelpCircle className="w-4 h-4 text-[#2D2926]/50" />
            </div>
            <div className="text-2xl font-serif text-[#2D2926] mt-1">
              {maybeCount + pendingCount}
            </div>
            <div className="text-[11px] text-[#2D2926]/70 mt-1">
              {maybeCount} Có thể • {pendingCount} Chờ hồi âm
            </div>
          </div>
        </div>

        {/* Headcount & Table Estimation Highlight - Editorial Banner */}
        <div className="bg-[#2D2926] text-[#FCFAF7] p-5 flex flex-col lg:flex-row items-center justify-between gap-4 border border-[#2D2926]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/10 border border-white/20 shrink-0">
              <UtensilsCrossed className="w-6 h-6 text-[#FCFAF7]" />
            </div>
            <div>
              <div className="uppercase text-[10px] tracking-[0.2em] text-[#D4C3B5]">
                ƯỚC TÍNH BÀN TIỆC NHÀ HÀNG DỰ KIẾN
              </div>
              <div className="text-lg font-serif italic mt-0.5">
                Khoảng <span className="text-white font-bold not-italic font-mono">{estimatedHeadcountTotal} người</span> dự tiệc
                (~<span className="text-white font-bold not-italic font-mono">{estimatedTablesTotal} bàn tiệc</span>)
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Interactive Table Type / Seats Selector */}
            <div className="flex items-center gap-2 bg-white/10 p-2 border border-white/20 text-xs w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[#D4C3B5] text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap">Loại bàn:</span>
              <select
                value={tableCapacity}
                onChange={(e) => handleTableCapacityChange(Number(e.target.value))}
                className="bg-[#1A1816] text-white font-mono font-semibold px-2.5 py-1.5 border border-white/30 focus:outline-none focus:border-white text-xs cursor-pointer"
                id="select-table-capacity"
              >
                <option value={10}>10 người / bàn (Chuẩn)</option>
                <option value={12}>12 người / bàn (Bàn lớn)</option>
                <option value={8}>8 người / bàn (Bàn vừa)</option>
                <option value={6}>6 người / bàn (Bàn nhỏ)</option>
                <option value={5}>5 người / bàn (Tiệc VIP)</option>
                <option value={16}>16 người / bàn (Bàn tròn đại)</option>
              </select>
            </div>

            <div className="text-xs font-mono text-[#D4C3B5] text-right bg-white/5 p-3 border border-white/10 w-full sm:w-auto">
              Chắc chắn: {totalAttendingHeadcount} người • Dự phòng từ Có thể: {Math.round(totalMaybeHeadcount * 0.5)} người
            </div>
          </div>
        </div>

        {/* Group distribution breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-center text-xs">
          {PRIMARY_GUEST_GROUPS.map((grpKey) => {
            const count = guests.filter(g => g.group === grpKey).length;
            const grpInvited = guests.filter(g => g.group === grpKey && g.isInvited).length;
            return (
              <div key={grpKey} className="bg-[#FCFAF7] p-2.5 border border-[#EBE3DC] flex flex-col justify-between">
                <span className="text-[#2D2926]/60 block text-[10px] uppercase tracking-wider truncate" title={GUEST_GROUP_LABELS[grpKey]}>
                  {GUEST_GROUP_LABELS[grpKey]}
                </span>
                <strong className="text-[#2D2926] text-sm font-serif mt-1">{count} thiệp</strong>
                <span className="text-[10px] font-mono text-[#2D2926]/60 mt-0.5">
                  Đã mời: {grpInvited}/{count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* GUEST LIST TABLE & FILTERS */}
      <div className="bg-white border border-[#EBE3DC] overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 bg-[#FCFAF7] border-b border-[#EBE3DC] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#2D2926]/40" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, địa chỉ, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
            />
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
          >
            <option value="ALL">Tất cả nhóm khách ({guests.length})</option>
            {PRIMARY_GUEST_GROUPS.map(grp => (
              <option key={grp} value={grp}>{GUEST_GROUP_LABELS[grp]}</option>
            ))}
          </select>

          {/* Invitation Status Filter (Mục Tick Đã Mời / Dự Kiến) */}
          <select
            value={selectedInvited}
            onChange={(e) => setSelectedInvited(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926] font-medium"
          >
            <option value="ALL">Tất cả tình trạng mời ({guests.length})</option>
            <option value="INVITED">✓ Đã gửi thiệp / Đã mời ({invitedCount})</option>
            <option value="UNINVITED">⏳ Chưa mời - Chỉ dự kiến ({uninvitedCount})</option>
          </select>

          {/* RSVP Status Filter */}
          <select
            value={selectedRsvp}
            onChange={(e) => setSelectedRsvp(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
          >
            <option value="ALL">Tất cả phản hồi RSVP</option>
            <option value="ATTENDING">✓ Chắc chắn tham gia</option>
            <option value="MAYBE">❓ Có thể tham gia</option>
            <option value="DECLINED">✕ Không tham gia</option>
            <option value="PENDING">⏳ Chờ xác nhận</option>
          </select>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#FCFAF7] text-[#2D2926] text-[10px] uppercase tracking-[0.2em] border-b border-[#EBE3DC]">
                <th className="py-3.5 px-4 font-semibold">Khách Mời</th>
                <th className="py-3.5 px-3 font-semibold text-center" title="Tick để đánh dấu khách đã được mời hay mới chỉ trong danh sách dự kiến">
                  Đã Mời?
                </th>
                <th className="py-3.5 px-3 font-semibold">Nhóm</th>
                <th className="py-3.5 px-3 font-semibold">Số Điện Thoại & Địa Chỉ</th>
                <th className="py-3.5 px-3 font-semibold">Xác Nhận Tham Dự (RSVP)</th>
                <th className="py-3.5 px-3 text-center font-semibold">Đi Kèm</th>
                <th className="py-3.5 px-3 font-semibold">Bàn Tiệc</th>
                <th className="py-3.5 px-4 font-semibold">Ghi Chú Chi Tiết</th>
                <th className="py-3.5 px-3 text-right font-semibold">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DC] text-[#2D2926]">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#2D2926]/50 italic font-serif">
                    Chưa có thông tin khách mời phù hợp với bộ lọc. Bấm "Thêm Khách Mới" để cập nhật!
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest, idx) => {
                  const groupLabel = GUEST_GROUP_LABELS[guest.group];
                  const isInvited = !!guest.isInvited;

                  return (
                    <tr 
                      key={guest.id} 
                      className={`hover:bg-[#FCFAF7] transition-colors ${
                        isInvited ? 'bg-white' : 'bg-[#FCFAF7]/40'
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 font-medium text-[#2D2926] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[#2D2926]/40 text-xs font-mono">{idx + 1}.</span>
                          <span className="font-serif italic font-semibold text-base">{guest.name}</span>
                        </div>
                      </td>

                      {/* TÌNH TRẠNG MỜI (MỤC TICK: ĐÃ MỜI HAY CHỈ DỰ KIẾN) */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <label 
                          className="inline-flex items-center gap-2 cursor-pointer select-none group px-2 py-1 border transition-all duration-150 hover:shadow-xs"
                          style={{
                            backgroundColor: isInvited ? '#ECFDF5' : '#FCFAF7',
                            borderColor: isInvited ? '#A7F3D0' : '#EBE3DC'
                          }}
                          title={isInvited ? 'Đã mời/gửi thiệp (Bấm để chuyển về Dự kiến)' : 'Chưa mời - Dự kiến (Bấm để đánh dấu Đã mời)'}
                        >
                          <input
                            type="checkbox"
                            checked={isInvited}
                            onChange={(e) => onQuickToggleInvited?.(guest.id, e.target.checked)}
                            className="w-4 h-4 accent-[#2D2926] cursor-pointer"
                          />
                          <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                            isInvited ? 'text-emerald-800' : 'text-[#786F68]'
                          }`}>
                            {isInvited ? (
                              <>
                                <MailCheck className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Đã mời</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 text-[#786F68]/70" />
                                <span>Dự kiến</span>
                              </>
                            )}
                          </span>
                        </label>
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-block text-[10px] uppercase tracking-wider bg-[#F5F1EE] text-[#2D2926] px-2.5 py-1 border border-[#D4C3B5]">
                          {groupLabel}
                        </span>
                      </td>

                      {/* Phone & Address */}
                      <td className="py-3.5 px-3 text-xs max-w-xs">
                        {guest.phone && (
                          <div className="font-mono text-[#2D2926] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#2D2926]/40" />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                        {guest.address && (
                          <div className="text-[#2D2926]/60 text-[11px] flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-[#2D2926]/40 shrink-0" />
                            <span className="truncate">{guest.address}</span>
                          </div>
                        )}
                      </td>

                      {/* RSVP Status Dropdown */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={guest.rsvp}
                          onChange={(e) => onQuickUpdateRSVP(guest.id, e.target.value as GuestRSVPStatus)}
                          className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 bg-[#FCFAF7] border border-[#D4C3B5] text-[#2D2926] focus:outline-none transition-colors"
                        >
                          <option value="ATTENDING">✓ Chắc chắn tham gia</option>
                          <option value="MAYBE">❓ Có thể tham gia</option>
                          <option value="DECLINED">✕ Không tham gia</option>
                          <option value="PENDING">⏳ Chờ xác nhận</option>
                        </select>
                      </td>

                      {/* Plus Ones */}
                      <td className="py-3.5 px-3 text-center font-mono font-medium text-[#2D2926] whitespace-nowrap">
                        {guest.plusOnes > 0 ? (
                          <span className="bg-[#F5F1EE] text-[#2D2926] px-2 py-0.5 border border-[#D4C3B5] text-xs">
                            +{guest.plusOnes} người
                          </span>
                        ) : (
                          <span className="text-[#2D2926]/40 font-normal">1 mình</span>
                        )}
                      </td>

                      {/* Table Number */}
                      <td className="py-3.5 px-3 text-xs font-mono text-[#2D2926] whitespace-nowrap">
                        {guest.tableNumber || <span className="text-[#2D2926]/40 italic">Chưa xếp</span>}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-xs text-[#2D2926]/70 max-w-xs">
                        <p className="truncate italic">{guest.notes || '-'}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditGuest(guest)}
                            className="p-1.5 hover:bg-[#2D2926] hover:text-[#FCFAF7] text-[#2D2926] transition-colors border border-[#EBE3DC]"
                            title="Sửa khách mời"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteGuest(guest.id)}
                            className="p-1.5 hover:bg-[#2D2926] hover:text-[#FCFAF7] text-[#2D2926] transition-colors border border-[#EBE3DC]"
                            title="Xóa khách mời"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-[#FCFAF7] p-4 text-xs text-[#2D2926]/70 uppercase tracking-wider font-mono border-t border-[#EBE3DC] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Hiển thị {filteredGuests.length} / {guests.length} khách dự kiến</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-800 font-semibold">Đã mời: {invitedCount} thiệp ({invitedPercentage}%)</span>
            <span>Chắc chắn tham gia: {attendingCount} thiệp ({totalAttendingHeadcount} người dự)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
