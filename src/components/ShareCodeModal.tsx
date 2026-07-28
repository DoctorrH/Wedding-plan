import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Key, 
  RefreshCw, 
  AlertCircle,
  Calendar,
  CheckSquare,
  Users,
  Sparkles
} from 'lucide-react';
import { 
  WeddingDetails, 
  TaskItem, 
  GuestItem, 
  TaskCategory 
} from '../types';
import { 
  createShareCode, 
  getShareData, 
  importShareDataToUser, 
  ShareDataPayload 
} from '../lib/firebase';
import confetti from 'canvas-confetti';

interface ShareCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingDetails: WeddingDetails;
  categoryNames: Record<TaskCategory, string>;
  tasks: TaskItem[];
  guests: GuestItem[];
  currentUserId?: string;
  onImportSuccess?: () => void;
}

export const ShareCodeModal: React.FC<ShareCodeModalProps> = ({
  isOpen,
  onClose,
  weddingDetails,
  categoryNames,
  tasks,
  guests,
  currentUserId,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Export State
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Import State
  const [inputCode, setInputCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [previewData, setPreviewData] = useState<ShareDataPayload | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle Generate Code
  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const code = await createShareCode({
        weddingDetails,
        categoryNames,
        tasks,
        guests,
      });
      setGeneratedCode(code);
      setIsCopied(false);
    } catch (err) {
      console.error('Error creating share code:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Copy Code
  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Handle Search Code for Import
  const handleSearchCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      setSearchError('Vui lòng nhập mã sao chép');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setPreviewData(null);
    setImportSuccessMsg('');

    try {
      const data = await getShareData(code);
      if (!data) {
        setSearchError('Mã không hợp lệ hoặc không tồn tại trên hệ thống.');
      } else {
        setPreviewData(data);
      }
    } catch (err) {
      console.error('Error fetching share code:', err);
      setSearchError('Có lỗi xảy ra khi kiểm tra mã. Vui lòng thử lại.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Confirm Import
  const handleConfirmImport = async () => {
    if (!previewData) return;

    setIsImporting(true);
    try {
      await importShareDataToUser(previewData, currentUserId);
      setImportSuccessMsg('Đã sao chép thành công toàn bộ dữ liệu vào tài khoản của bạn!');
      
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onImportSuccess) {
        onImportSuccess();
      }

      setTimeout(() => {
        onClose();
        setPreviewData(null);
        setInputCode('');
        setImportSuccessMsg('');
      }, 2000);
    } catch (err) {
      console.error('Error importing share data:', err);
      setSearchError('Lỗi khi sao chép dữ liệu vào tài khoản.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-[#FCFAF7] border-2 border-[#1A1816] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#2D2926] text-[#FCFAF7]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#D4C3B5]" />
            <h2 className="text-lg font-serif font-bold tracking-tight">Sao Chép Dữ Liệu Giữa Các Tài Khoản</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#423D38] text-[#D4C3B5] hover:text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#D4C3B5] bg-[#F5F1EE]">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-[#FCFAF7] text-[#1A1816] border-b-2 border-[#1A1816]'
                : 'text-[#786F68] hover:text-[#1A1816]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Tạo Mã Chia Sẻ</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-[#FCFAF7] text-[#1A1816] border-b-2 border-[#1A1816]'
                : 'text-[#786F68] hover:text-[#1A1816]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Nhập Mã Sao Chép</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: EXPORT CODE */}
          {activeTab === 'export' && (
            <div className="space-y-5 text-[#2D2926]">
              <p className="text-xs text-[#524B46] leading-relaxed">
                Tính năng này giúp bạn đóng gói toàn bộ <strong>Thông tin ngày cưới</strong>, <strong>Hạng mục & Công việc</strong>, và <strong>Danh sách Khách mời</strong> thành 1 đoạn mã ngẫu nhiên 6 ký tự để chia sẻ hoặc đồng bộ sang tài khoản khác.
              </p>

              {!generatedCode ? (
                <div className="p-5 border border-dashed border-[#D4C3B5] bg-[#F9F6F0] text-center space-y-4">
                  <div className="p-3 bg-[#EBE3DC] rounded-full inline-block">
                    <Key className="w-6 h-6 text-[#1A1816]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-[#1A1816] text-base">Tạo Mã Ngẫu Nhiên Mới</h3>
                    <p className="text-[11px] text-[#786F68] mt-1">
                      Mã này sẽ lưu lại trạng thái dữ liệu hiện tại của bạn
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateCode}
                    disabled={isGenerating}
                    className="w-full py-2.5 px-4 bg-[#1A1816] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#332E2B] transition-colors flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang khởi tạo mã...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#D4C3B5]" />
                        <span>Tạo Mã Sao Chép</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border-2 border-[#1A1816] bg-[#F5F1EE] text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#786F68] block">Mã sao chép ngẫu nhiên của bạn</span>
                    <div className="text-3xl font-mono font-bold tracking-widest text-[#1A1816] select-all py-1">
                      {generatedCode}
                    </div>
                    <p className="text-[11px] text-[#786F68]">
                      Tên gói: Lễ cưới {weddingDetails.groomName || 'Chú rể'} & {weddingDetails.brideName || 'Cô dâu'} ({tasks.length} công việc, {guests.length} khách mời)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyCode}
                      className={`flex-1 py-2.5 px-4 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                        isCopied 
                          ? 'bg-emerald-800 text-white border-emerald-800' 
                          : 'bg-[#1A1816] text-white border-[#1A1816] hover:bg-[#332E2B]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Đã Sao Chép Mã!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Sao Chép Mã Vào Bộ Nhớ</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleGenerateCode}
                      disabled={isGenerating}
                      className="px-3 py-2.5 border border-[#1A1816] text-[#1A1816] hover:bg-[#EBE3DC] transition-colors"
                      title="Tạo mã mới"
                    >
                      <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <p className="text-[11px] text-[#786F68] italic text-center">
                    Gửi mã này cho tài khoản khác để họ nhập vào mục &quot;Nhập Mã Sao Chép&quot;.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT CODE */}
          {activeTab === 'import' && (
            <div className="space-y-4 text-[#2D2926]">
              <form onSubmit={handleSearchCode} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1816]">
                  Nhập mã sao chép (6 ký tự)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: 8F3K9A"
                    maxLength={10}
                    className="flex-1 px-3 py-2.5 bg-white border border-[#1A1816] font-mono text-base font-bold tracking-widest text-[#1A1816] placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#1A1816]"
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !inputCode.trim()}
                    className="px-4 py-2.5 bg-[#1A1816] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#332E2B] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Kiểm Tra</span>}
                  </button>
                </div>
              </form>

              {searchError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {importSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {previewData && !importSuccessMsg && (
                <div className="p-4 border border-[#1A1816] bg-[#F9F6F0] space-y-3 mt-4">
                  <div className="flex items-center justify-between border-b border-[#D4C3B5] pb-2">
                    <span className="text-xs font-bold uppercase text-[#1A1816]">Tìm Thấy Dữ Liệu</span>
                    <span className="text-[10px] font-mono text-[#786F68]">{new Date(previewData.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="font-serif text-base font-bold text-[#1A1816]">
                      Lễ Cưới Của {previewData.weddingDetails.groomName || 'Chú rể'} & {previewData.weddingDetails.brideName || 'Cô dâu'}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="bg-white p-2 border border-[#EBE3DC] text-center">
                        <Calendar className="w-3.5 h-3.5 mx-auto mb-1 text-[#786F68]" />
                        <span className="font-bold block text-[#1A1816]">
                          {previewData.weddingDetails.weddingDate ? new Date(previewData.weddingDetails.weddingDate).toLocaleDateString('vi-VN') : 'Chưa đặt'}
                        </span>
                        <span className="text-[9px] text-[#786F68]">Ngày cưới</span>
                      </div>
                      <div className="bg-white p-2 border border-[#EBE3DC] text-center">
                        <CheckSquare className="w-3.5 h-3.5 mx-auto mb-1 text-[#786F68]" />
                        <span className="font-bold block text-[#1A1816]">{previewData.tasks?.length || 0}</span>
                        <span className="text-[9px] text-[#786F68]">Công việc</span>
                      </div>
                      <div className="bg-white p-2 border border-[#EBE3DC] text-center">
                        <Users className="w-3.5 h-3.5 mx-auto mb-1 text-[#786F68]" />
                        <span className="font-bold block text-[#1A1816]">{previewData.guests?.length || 0}</span>
                        <span className="text-[9px] text-[#786F68]">Khách mời</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FFF8EE] border border-[#E3D1B8] text-[11px] text-[#8C6D46] leading-snug">
                    ⚠️ <strong>Cảnh báo:</strong> Thao tác này sẽ ghi đè dữ liệu hiện tại trong tài khoản của bạn bằng dữ liệu từ mã <strong>{previewData.code}</strong>.
                  </div>

                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="w-full py-2.5 px-4 bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-900 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang nhập dữ liệu...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Xác Nhận Sao Chép Dữ Liệu Ngay</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#F5F1EE] border-t border-[#D4C3B5] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-[#786F68] text-[#2D2926] hover:bg-[#EBE3DC] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
