import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Check,
  BookOpen,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { PRESET_USERS } from '../data';
import { signInWithGoogle, saveUserProfileToFirestore } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSelectUser,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'presets'>('gmail');
  const [emailInput, setEmailInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [classInput, setClassInput] = useState<string>('Lớp 7A1');
  const [roleInput, setRoleInput] = useState<UserRole>('student');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Google OAuth / Popup Login
  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        const displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Học sinh';
        const userProfile: UserProfile = {
          id: `usr_${fbUser.uid}`,
          name: displayName,
          email: fbUser.email || undefined,
          role: roleInput,
          class: roleInput === 'student' ? (classInput.trim() || 'Lớp 7A1') : roleInput === 'teacher' ? 'Giáo viên bộ môn' : 'Phụ huynh',
          avatar: displayName.slice(0, 2).toUpperCase()
        };

        // Save to Firestore and parent state
        await saveUserProfileToFirestore(userProfile);
        onSelectUser(userProfile);
        onClose();
        onShowToast(`🎉 Đăng nhập thành công với Google (${fbUser.email})!`);
      }
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      // If popup fails or blocked inside iframe, gracefully guide user to direct Gmail login
      onShowToast('ℹ️ Hãy nhập địa chỉ Gmail bên dưới để đăng nhập trực tiếp một cách nhanh chóng!');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Handle direct Gmail / Email Login form
  const handleDirectGmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      onShowToast('⚠️ Vui lòng nhập họ và tên của bạn.');
      return;
    }

    const emailClean = emailInput.trim().toLowerCase();
    const cleanName = nameInput.trim();
    const initials = cleanName
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(-2)
      .toUpperCase() || cleanName.slice(0, 2).toUpperCase();

    const userProfile: UserProfile = {
      id: emailClean ? `usr_email_${emailClean.replace(/[^a-z0-9]/gi, '_')}` : `usr_${Date.now()}`,
      name: cleanName,
      email: emailClean ? (emailClean.includes('@') ? emailClean : `${emailClean}@gmail.com`) : undefined,
      role: roleInput,
      class: roleInput === 'student' ? (classInput.trim() || 'Lớp 7A1') : roleInput === 'teacher' ? (classInput.trim() || 'Giáo viên bộ môn') : 'Phụ huynh học sinh',
      avatar: initials
    };

    await saveUserProfileToFirestore(userProfile);
    onSelectUser(userProfile);
    onClose();
    onShowToast(`✅ Xin chào ${userProfile.name}! Hệ thống đã tự động lưu thông tin để lần sau vào dùng được ngay.`);
  };

  return (
    <div
      id="modal-auth"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              LR
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Đăng Nhập Tài Khoản</h3>
              <p className="text-xs text-slate-400 font-medium">Tự động lưu phiên để lần sau vào dùng được luôn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Gmail vs Presets */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl mt-5 mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('gmail')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'gmail' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-rose-500" />
            <span>Đăng nhập Gmail / Google</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'presets' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>Tài khoản mẫu thử nghiệm</span>
          </button>
        </div>

        {/* TAB 1: GMAIL & GOOGLE LOGIN */}
        {activeTab === 'gmail' && (
          <div className="flex flex-col gap-4">
            {/* Quick Google Sign In button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoadingGoogle}
              className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-800 font-extrabold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-3 cursor-pointer shadow-2xs"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>{isLoadingGoogle ? 'Đang kết nối Google...' : 'Đăng nhập nhanh với tài khoản Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoặc nhập thông tin Gmail</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* Direct Form */}
            <form onSubmit={handleDirectGmailSubmit} className="flex flex-col gap-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Bạn là:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleInput('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                      roleInput === 'student'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🎓 Học sinh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleInput('teacher')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                      roleInput === 'teacher'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>👩‍🏫 Giáo viên</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleInput('parent')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex flex-col items-center gap-1 ${
                      roleInput === 'parent'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>👨‍👩‍👧 Phụ huynh</span>
                  </button>
                </div>
              </div>

              {/* Gmail / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Địa chỉ Gmail của bạn</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tự động gắn vào bài viết</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="vidu: hocsinh.minhanh@gmail.com"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và Tên</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Minh Anh, Trần Đức Huy..."
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Class / Subject */}
              {roleInput === 'student' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Lớp học</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Lớp 7A1, Lớp 8B, Lớp 9A2..."
                    value={classInput}
                    onChange={e => setClassInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              ) : roleInput === 'teacher' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bộ môn / Chức vụ</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: GVCN & Bộ môn Văn 7A1, Giáo viên Tiếng Anh..."
                    value={classInput}
                    onChange={e => setClassInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              ) : null}

              {/* Persistence Guarantee Notice */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Tự động ghi nhớ:</strong> Bạn chỉ cần đăng nhập lần đầu, hệ thống sẽ tự động lưu tên & Gmail để những lần sau vào app là sử dụng được ngay!
                </p>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập & Lưu Vào Thiết Bị</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: PRESETS */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-500 mb-1">
              Nhấn vào tài khoản bên dưới để chuyển đổi vai trò ngay lập tức:
            </p>
            {PRESET_USERS.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onSelectUser(u);
                  onClose();
                  onShowToast(`✅ Đã chuyển sang tài khoản ${u.name} (${u.role === 'student' ? 'Học sinh' : u.role === 'teacher' ? 'Giáo viên' : 'Phụ huynh'})`);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition text-left cursor-pointer ${
                  currentUser.id === u.id
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm ${
                      u.role === 'teacher' ? 'bg-purple-600' : u.role === 'parent' ? 'bg-rose-600' : 'bg-blue-600'
                    }`}
                  >
                    {u.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">
                      {u.role === 'teacher' ? '👩‍🏫 Giáo viên chấm bài' : u.role === 'parent' ? '👨‍👩‍👧 Phụ huynh học sinh' : `🎓 Học sinh (${u.class})`}
                    </p>
                    {u.email && <p className="text-[11px] text-blue-600 font-mono">{u.email}</p>}
                  </div>
                </div>
                {currentUser.id === u.id ? (
                  <Check className="w-5 h-5 text-blue-600" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
