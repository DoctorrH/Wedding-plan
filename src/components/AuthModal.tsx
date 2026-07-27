import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
      onClose();
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
      onClose();
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      let errMsg = 'Không thể đăng nhập bằng Google. Vui lòng thử lại.';
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        errMsg = `Google Sign-In bị giới hạn tên miền trên Netlify (${currentDomain}). Vui lòng dùng Đăng nhập bằng Email/Mật khẩu bên dưới — hoạt động 100% đầy đủ tính năng!`;
      } else if (err.code === 'auth/popup-blocked') {
        errMsg = 'Trình duyệt đã chặn popup. Vui lòng cho phép bật popup và thử lại.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Đăng nhập Google chưa được kích hoạt trong Firebase Console.';
      } else if (err.message) {
        errMsg = `Đăng nhập Google thất bại (${err.code || 'lỗi'}). Hãy dùng Đăng nhập Email.`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FCFAF7] max-w-md w-full border border-[#D4C3B5] animate-in fade-in zoom-in-95 duration-150 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-white p-5 border-b border-[#EBE3DC] flex items-center justify-between">
          <h3 className="font-serif italic text-2xl text-[#2D2926] flex items-center gap-2">
            {isSignUp ? <UserPlus className="w-5 h-5 text-[#2D2926]" /> : <LogIn className="w-5 h-5 text-[#2D2926]" />}
            <span>{isSignUp ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập Firebase'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#EBE3DC] text-[#2D2926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white border border-[#EBE3DC] hover:border-[#2D2926] text-[#2D2926] text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <hr className="w-full border-[#EBE3DC]" />
            <span className="absolute bg-[#FCFAF7] px-3 text-[10px] uppercase tracking-widest text-[#2D2926]/50 font-semibold">
              Hoặc dùng Email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                  Họ và Tên
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-[#2D2926]/40" />
                  <input
                    type="text"
                    required={isSignUp}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Địa chỉ Email <span className="text-red-700">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#2D2926]/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#2D2926] mb-1">
                Mật Khẩu <span className="text-red-700">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#2D2926]/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EBE3DC] focus:outline-none focus:border-[#2D2926] text-[#2D2926]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#2D2926] hover:bg-black text-[#FCFAF7] text-xs uppercase tracking-widest font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng Ký Tài Khoản</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2 border-t border-[#EBE3DC]">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-[#2D2926] hover:underline font-medium"
            >
              {isSignUp ? (
                <span>Đã có tài khoản? <strong>Đăng nhập ngay</strong></span>
              ) : (
                <span>Chưa có tài khoản? <strong>Tạo tài khoản mới</strong></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
