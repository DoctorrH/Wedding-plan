import React, { useState } from 'react';
import { 
  Heart, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Calendar, 
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
  updateProfile 
} from '../lib/firebase';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(userCred.user, { displayName: displayName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errMsg = 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Email hoặc mật khẩu không chính xác.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Email này đã được sử dụng.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Địa chỉ email không hợp lệ.';
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = 'Thử lại quá nhiều lần. Vui lòng thử lại sau ít phút.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      let errMsg = 'Không thể đăng nhập bằng Google. Vui lòng thử lại.';
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        errMsg = `Tên miền (${currentDomain}) chưa có trong Authorized Domains của Firebase project "weddingplan-57537". Hãy vào Firebase Console của bạn > Authentication > Settings > Authorized domains > bấm "Add domain" và nhập: ${currentDomain}`;
      } else if (err.code === 'auth/popup-blocked') {
        errMsg = 'Trình duyệt đã chặn cửa sổ bật lên (popup). Vui lòng cho phép mở popup trên trình duyệt và thử lại.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Đăng nhập Google chưa được bật trong Firebase Console (Authentication -> Sign-in method).';
      } else if (err.message) {
        errMsg = `Không thể đăng nhập bằng Google (${err.code || 'lỗi'}). Vui lòng dùng Email/Mật khẩu hoặc dùng thử tài khoản Khách.`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Guest Sign in error:', err);
      setError('Không thể đăng nhập với tư cách Khách. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#1A1816] flex flex-col justify-between selection:bg-[#D4C3B5]/30">
      {/* Top Banner Header */}
      <header className="border-b border-[#EBE3DC] bg-white py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A1816] text-[#FCFAF7] flex items-center justify-center font-serif font-bold text-lg">
              S
            </div>
            <div>
              <span className="font-serif italic font-bold text-lg md:text-xl text-[#1A1816] tracking-tight block">
                Sổ Tay Kế Hoạch Cưới
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#786F68] block">
                Editorial Wedding Planner
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Branding & Value Props */}
          <div className="lg:col-span-7 space-y-6 md:pr-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold text-[#1A1816] leading-[1.15]">
              Quản Lý Kế Hoạch Cưới Hoàn Hảo Cho Ngày Trọng Đại Của Bạn
            </h1>

            <p className="text-sm md:text-base text-[#423D38] leading-relaxed font-normal max-w-2xl">
              Đăng nhập để khởi tạo sổ tay cưới riêng biệt. Dữ liệu công việc, ngân sách, lịch trình và danh sách khách mời của cặp đôi sẽ được bảo lưu an toàn và đồng bộ thời gian thực.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-[#EBE3DC] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1A1816] font-bold text-sm">
                  <DollarSign className="w-4 h-4 text-[#1A1816]" />
                  <span>Quản Lý Ngân Sách</span>
                </div>
                <p className="text-xs text-[#786F68] leading-normal">
                  Theo dõi tổng dự toán, thực tế, tiền cọc và số tiền còn lại phải thanh toán cho từng nhà cung cấp.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#EBE3DC] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1A1816] font-bold text-sm">
                  <Calendar className="w-4 h-4 text-[#1A1816]" />
                  <span>Lịch Trình Đếm Ngược</span>
                </div>
                <p className="text-xs text-[#786F68] leading-normal">
                  Ghi chú các cột mốc quan trọng theo tháng, đếm ngược ngày cưới và nhắc nhở việc cần làm.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#EBE3DC] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1A1816] font-bold text-sm">
                  <Users className="w-4 h-4 text-[#1A1816]" />
                  <span>Khách Mời & Bàn Tiệc</span>
                </div>
                <p className="text-xs text-[#786F68] leading-normal">
                  Phân nhóm khách hai họ, xác nhận RSVP tham dự, đếm số người đi kèm và bố trí bàn tiệc chuẩn xác.
                </p>
              </div>

              <div className="p-4 bg-white border border-[#EBE3DC] space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1A1816] font-bold text-sm">
                  <Heart className="w-4 h-4 text-[#1A1816]" />
                  <span>Đồng Bộ Riêng Tư</span>
                </div>
                <p className="text-xs text-[#786F68] leading-normal">
                  Mỗi tài khoản lưu giữ nội dung hoàn toàn độc lập, đảm bảo tính riêng tư tuyệt đối cho cặp đôi.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white border border-[#DCD3CC] shadow-xl p-6 sm:p-8 space-y-6">
              
              {/* Header Title & Tab Switch */}
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-[#F3EEEA] border border-[#DCD3CC] rounded-full flex items-center justify-center mx-auto text-[#1A1816]">
                  {isSignUp ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#1A1816]">
                    {isSignUp ? 'Tạo Tài Khoản Kế Hoạch Cưới' : 'Đăng Nhập Tài Khoản'}
                  </h2>
                  <p className="text-xs text-[#786F68] mt-1 font-medium">
                    {isSignUp 
                      ? 'Nhập thông tin bên dưới để bắt đầu sổ tay riêng của bạn' 
                      : 'Đăng nhập để truy cập dữ liệu cưới đã lưu'}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-[#F3EEEA] border border-[#DCD3CC]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className={`py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      !isSignUp 
                        ? 'bg-white text-[#1A1816] shadow-2xs border border-[#DCD3CC]' 
                        : 'text-[#786F68] hover:text-[#1A1816]'
                    }`}
                  >
                    Đăng Nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    className={`py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      isSignUp 
                        ? 'bg-white text-[#1A1816] shadow-2xs border border-[#DCD3CC]' 
                        : 'text-[#786F68] hover:text-[#1A1816]'
                    }`}
                  >
                    Tạo Tài Khoản
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-700 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Quick Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white border border-[#1A1816] hover:bg-[#F3EEEA] text-[#1A1816] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập nhanh bằng Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <hr className="w-full border-[#DCD3CC]" />
                <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-[#786F68]">
                  HOẶC BẰNG EMAIL
                </span>
              </div>

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1816] mb-1">
                      Họ và Tên
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-3 text-[#786F68]" />
                      <input
                        type="text"
                        required={isSignUp}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="VD: Minh Đức & Thu Trang"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FCFAF7] border border-[#DCD3CC] focus:outline-none focus:border-[#1A1816] text-[#1A1816] font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1816] mb-1">
                    Địa chỉ Email <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-[#786F68]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ban@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FCFAF7] border border-[#DCD3CC] focus:outline-none focus:border-[#1A1816] text-[#1A1816] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1A1816] mb-1">
                    Mật Khẩu <span className="text-red-700">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-[#786F68]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mật khẩu tối thiểu 6 ký tự"
                      minLength={6}
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FCFAF7] border border-[#DCD3CC] focus:outline-none focus:border-[#1A1816] text-[#1A1816] font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#786F68] hover:text-[#1A1816]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1A1816] hover:bg-black text-[#FCFAF7] text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isSignUp ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Tạo Tài Khoản Ngay</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Đăng Nhập Sổ Tay</span>
                    </>
                  )}
                </button>
              </form>

              {/* Guest Access Alternative */}
              <div className="pt-2 border-t border-[#EBE3DC] text-center space-y-2">
                <p className="text-[11px] text-[#786F68] font-medium">
                  Muốn xem thử giao diện mà chưa muốn tạo tài khoản?
                </p>
                <button
                  type="button"
                  onClick={handleGuestSignIn}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1816] hover:underline"
                >
                  <span>Dùng thử với tài khoản Khách (Guest)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EBE3DC] bg-white py-2" />
    </div>
  );
};
