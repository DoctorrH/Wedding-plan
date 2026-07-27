import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, BookOpen, Heart, RefreshCw } from 'lucide-react';
import { WeddingDetails } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingDetails: WeddingDetails;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  weddingDetails,
}) => {
  const [prompt, setPrompt] = useState('');
  const [promptType, setPromptType] = useState<'general' | 'invitation' | 'checklist' | 'script'>('general');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      title: '✉️ Mẫu Tin Nhắn Mời Cưới',
      type: 'invitation',
      prompt: `Hãy soạn giúp tôi 2 mẫu tin nhắn mời cưới (1 mẫu gửi cho người lớn tuổi/họ hàng trang trọng, 1 mẫu gửi cho bạn bè gần gũi) dành cho cô dâu ${weddingDetails.brideName || 'Thu Trang'} và chú rể ${weddingDetails.groomName || 'Minh Đức'}, đám cưới diễn ra ngày ${weddingDetails.weddingDate || '20/11/2026'} tại ${weddingDetails.venue || 'White Palace'}.`,
    },
    {
      title: '💰 Gợi Ý Phân Bổ Ngân Sách',
      type: 'general',
      prompt: `Hãy gợi ý cách phân bổ ngân sách chi tiết cho đám cưới ở Việt Nam với tổng hạn mức ${weddingDetails.totalBudgetLimit ? weddingDetails.totalBudgetLimit.toLocaleString('vi-VN') : '250.000.000'} VNĐ (phần trăm & số tiền dự kiến cho Nhà hàng, Trang phục, Nhẫn cưới, Chụp ảnh, Lễ ăn hỏi, Trang trí).`,
    },
    {
      title: '📜 Kịch Bản Lễ Gia Tiên & Ăn Hỏi',
      type: 'script',
      prompt: `Soạn giúp tôi kịch bản các bước chuẩn bị & trình tự diễn ra Lễ Dặm Ngõ và Lễ Ăn Hỏi truyền thống miền Nam/miền Bắc cho chú rể ${weddingDetails.groomName} và cô dâu ${weddingDetails.brideName}.`,
    },
    {
      title: '📝 Checklist Đếm Ngược 3 Tháng',
      type: 'checklist',
      prompt: `Tạo checklist chi tiết các công việc cô dâu chú rể cần hoàn thành trong 3 tháng cuối cùng trước ngày cưới ${weddingDetails.weddingDate || '20/11/2026'}.`,
    },
  ];

  const handleSendQuery = async (customPrompt?: string, typeOverride?: any) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');
    setCopied(false);

    try {
      const res = await fetch('/api/gemini/wedding-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          type: typeOverride || promptType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi kết nối máy chủ Gemini AI.');
      }

      setResponse(data.text);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tạo phản hồi AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif">Trợ Lý AI Lập Kế Hoạch Cưới Gemini</h3>
              <p className="text-xs text-purple-200">Tư vấn ngân sách, soạn thiệp mời & kịch bản cưới chuyên nghiệp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto grow">
          {/* Quick Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              💡 Gợi ý câu hỏi nhanh cho Cô Dâu & Chú Rể:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(item.prompt);
                    setPromptType(item.type as any);
                    handleSendQuery(item.prompt, item.type);
                  }}
                  disabled={loading}
                  className="text-left p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 hover:border-purple-300 transition-colors text-xs font-semibold text-purple-950 flex items-center justify-between"
                >
                  <span>{item.title}</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* User Input Form */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Nhập câu hỏi hoặc yêu cầu riêng của bạn:
              </label>
            </div>
            <div className="flex gap-2">
              <textarea
                rows={2}
                placeholder="VD: Hãy gợi ý danh sách quà tặng cảm ơn khách mời độc đáo..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="grow px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium text-slate-800"
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={loading || !prompt.trim()}
                className="px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center shrink-0"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* AI Output Result */}
          {response && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Kết quả tư vấn từ Gemini AI:</span>
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép nội dung'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs leading-relaxed space-y-2 font-sans whitespace-pre-wrap max-h-72 overflow-y-auto border border-slate-800 shadow-inner">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>Powered by Gemini 2.5 Flash</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 font-semibold text-slate-800 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
