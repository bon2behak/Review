import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Plus,
  Search,
  X,
  Check,
  ChevronRight,
  Share2,
  Heart,
  HelpCircle,
  Mail,
  Edit3,
  Eye,
  CheckCheck,
  Bell,
  Menu,
  Type,
  Volume2,
  Maximize2,
  Cloud,
  CloudCheck,
  RefreshCw,
  Keyboard,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { UserRole, UserProfile, ReviewItem, TaskItem, RewardItem, AppNotification } from './types';
import { PRESET_USERS, INITIAL_REVIEWS, INITIAL_TASKS, INITIAL_REWARDS, INITIAL_NOTIFICATIONS } from './data';
import { ReviewReaderModal } from './components/ReviewReaderModal';
import { AuthModal } from './components/AuthModal';
import {
  auth,
  onAuthStateChanged,
  type FirebaseUser,
  logOutFromFirebase,
  getUserProfileFromFirestore,
  seedInitialDataIfEmpty,
  subscribeToReviews,
  subscribeToNotifications,
  subscribeToTasks,
  subscribeToRewards,
  createReviewInFirestore,
  updateReviewInFirestore,
  createNotificationInFirestore,
  markNotificationReadInFirestore
} from './firebase';

export default function App() {
  // Core State with Persistent Local Storage Auto-Login
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('learn_review_active_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load saved user session:', e);
    }
    return PRESET_USERS[0];
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'reviews' | 'tasks' | 'rewards' | 'grading' | 'parent_feed'>('dashboard');
  const [points, setPoints] = useState<number>(245);
  const [streakDays, setStreakDays] = useState<number>(7);
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'syncing'>('connected');

  // Modals and UI States
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [readingReview, setReadingReview] = useState<ReviewItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState<boolean>(false);
  const [showLoginGuide, setShowLoginGuide] = useState<boolean>(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [gradingReview, setGradingReview] = useState<ReviewItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('all');

  // Save active user profile automatically on every change
  useEffect(() => {
    try {
      localStorage.setItem('learn_review_active_user', JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Could not save user session:', e);
    }
  }, [currentUser]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        try {
          const profile = await getUserProfileFromFirestore(`usr_${fbUser.uid}`);
          if (profile) {
            setCurrentUser(profile);
          }
        } catch (e) {
          console.warn('Error fetching user profile from Firestore:', e);
        }
      }
    });
    return () => unsubAuth();
  }, []);

  // Firebase Realtime Subscriptions
  useEffect(() => {
    // Seed initial demo data to Firestore if collection is empty
    seedInitialDataIfEmpty();

    // Subscribe to real-time changes across all connected devices
    const unsubReviews = subscribeToReviews(cloudReviews => {
      if (cloudReviews.length > 0) {
        setReviews(cloudReviews);
      }
    });

    const unsubNotifs = subscribeToNotifications(cloudNotifs => {
      if (cloudNotifs.length > 0) {
        setNotifications(cloudNotifs);
      }
    });

    const unsubTasks = subscribeToTasks(cloudTasks => {
      if (cloudTasks.length > 0) {
        setTasks(cloudTasks);
      }
    });

    const unsubRewards = subscribeToRewards(cloudRewards => {
      if (cloudRewards.length > 0) {
        setRewards(cloudRewards);
      }
    });

    return () => {
      unsubReviews();
      unsubNotifs();
      unsubTasks();
      unsubRewards();
    };
  }, []);

  // App-wide font scaling ('normal': 16px, 'large': 18px, 'xlarge': 20px)
  const [appFontSize, setAppFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Custom User Login Form (Fallback inside switcher)
  const [customLoginName, setCustomLoginName] = useState<string>('');
  const [customLoginRole, setCustomLoginRole] = useState<UserRole>('student');
  const [customLoginClass, setCustomLoginClass] = useState<string>('Lớp 7A1');

  // New review form state
  const [newSubject, setNewSubject] = useState<string>('Ngữ Văn');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newChapter, setNewChapter] = useState<string>('');
  const [newText, setNewText] = useState<string>('');
  const [newReflection, setNewReflection] = useState<string>('');

  // Grading form state (Teacher)
  const [gradeScore, setGradeScore] = useState<number>(9.0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradeStatus, setGradeStatus] = useState<'completed' | 'needs_revision'>('completed');

  // Parent encouragement form state
  const [parentCommentInput, setParentCommentInput] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Switch Role / User
  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    setShowRoleSwitcher(false);
    if (user.role === 'teacher') {
      setCurrentTab('grading');
      showToast(`👩‍🏫 Đã chuyển sang giao diện Giáo viên (${user.name})`);
    } else if (user.role === 'parent') {
      setCurrentTab('parent_feed');
      showToast(`👨‍👩‍👧 Đã chuyển sang Sổ liên lạc Phụ huynh (${user.name})`);
    } else {
      setCurrentTab('dashboard');
      showToast(`🎓 Đã đăng nhập với tư cách Học sinh (${user.name} - ${user.class})`);
    }
  };

  // Custom Login
  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLoginName.trim()) return;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: customLoginName.trim(),
      role: customLoginRole,
      class: customLoginClass.trim() || 'Lớp 7A1',
      avatar: customLoginName.trim().slice(0, 2).toUpperCase()
    };

    setCurrentUser(newUser);
    setShowRoleSwitcher(false);
    setCustomLoginName('');
    showToast(`✅ Xin chào ${newUser.name}! Hệ thống đã lưu tên bạn để sử dụng.`);
  };

  // Create Review Handler (Triggers Student post + Teacher & Parent notifications & Syncs with Firestore)
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const newRevId = `rev-${Date.now()}`;
    const newRev: ReviewItem = {
      id: newRevId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class,
      studentAvatar: currentUser.avatar,
      studentEmail: currentUser.email,
      subject: newSubject,
      title: newTitle.trim(),
      chapter: newChapter.trim() || 'Tài liệu tự học',
      feedback: 'Bài viết đang chờ Giáo viên bộ môn xem xét và nhận xét.',
      deadline: 'Chờ duyệt',
      status: 'reviewing',
      date: 'Hôm nay',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Hôm nay',
      myText: newText.trim(),
      reflection: newReflection.trim()
    };

    // 1. Local state update
    setReviews([newRev, ...reviews]);

    // 2. Add points to student
    const earnedPoints = 25;
    setPoints(prev => prev + earnedPoints);

    // 3. Create real-time notification for TEACHER
    const teacherNotif: AppNotification = {
      id: `notif-${Date.now()}-teach`,
      targetRole: 'teacher',
      title: `Bài review mới từ ${currentUser.name} (${currentUser.class})`,
      message: `Học sinh vừa nộp bài viết môn ${newSubject}: "${newTitle}". Hãy vào chấm điểm và gửi phản hồi!`,
      timestamp: 'Vừa xong',
      read: false,
      type: 'review_submitted',
      relatedReviewId: newRevId
    };

    // 4. Create real-time notification for PARENT
    const parentNotif: AppNotification = {
      id: `notif-${Date.now()}-parent`,
      targetRole: 'parent',
      title: `Con của bạn (${currentUser.name}) vừa hoàn thành bài học!`,
      message: `Con vừa viết bài review cảm nhận môn ${newSubject}: "${newTitle}" và tích lũy +${earnedPoints} điểm.`,
      timestamp: 'Vừa xong',
      read: false,
      type: 'review_submitted',
      relatedReviewId: newRevId
    };

    setNotifications([teacherNotif, parentNotif, ...notifications]);

    // Reset and close
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewChapter('');
    setNewText('');
    setNewReflection('');

    showToast(`🎉 Đã lưu bài lên Firebase! +${earnedPoints} điểm. Ba mẹ & Giáo viên xem được bài tức thì.`);

    // Persist to Cloud Firestore for multi-device sync
    try {
      setFirebaseStatus('syncing');
      await createReviewInFirestore(newRev);
      await createNotificationInFirestore(teacherNotif);
      await createNotificationInFirestore(parentNotif);
      setFirebaseStatus('connected');
    } catch (err) {
      console.warn('Firebase sync error:', err);
      setFirebaseStatus('connected');
    }
  };

  // Update/Revise Review Handler (Student edits and re-submits anytime)
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    const updatedRev: ReviewItem = {
      ...editingReview,
      status: 'reviewing',
      feedback: 'Học sinh đã nộp lại bài chỉnh sửa mới nhất. Đang chờ giáo viên đánh giá/chấm lại.',
      urgent: false,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Nộp lại)'
    };

    setReviews(prev =>
      prev.map(r => (r.id === editingReview.id ? updatedRev : r))
    );

    // Notify teacher that revision was submitted
    const reviseNotif: AppNotification = {
      id: `notif-${Date.now()}-revised`,
      targetRole: 'teacher',
      title: `Bài nộp lại từ ${currentUser.name} (${currentUser.class})`,
      message: `Học sinh đã hoàn thiện và nộp lại bài review môn ${editingReview.subject}: "${editingReview.title}".`,
      timestamp: 'Vừa xong',
      read: false,
      type: 'review_submitted',
      relatedReviewId: editingReview.id
    };

    // Notify parent
    const parentReviseNotif: AppNotification = {
      id: `notif-${Date.now()}-par-revised`,
      targetRole: 'parent',
      title: `Con của bạn (${currentUser.name}) đã cập nhật bài viết!`,
      message: `Con vừa chỉnh sửa và nộp lại bài review "${editingReview.title}".`,
      timestamp: 'Vừa xong',
      read: false,
      type: 'review_submitted',
      relatedReviewId: editingReview.id
    };

    setNotifications([reviseNotif, parentReviseNotif, ...notifications]);

    const bonus = 15;
    setPoints(p => p + bonus);
    const targetId = editingReview.id;
    setEditingReview(null);
    showToast(`✨ Đã nộp lại bài sửa lên Cloud! +${bonus} điểm. Giáo viên đã nhận được bài cập nhật.`);

    try {
      await updateReviewInFirestore(targetId, updatedRev);
      await createNotificationInFirestore(reviseNotif);
      await createNotificationInFirestore(parentReviseNotif);
    } catch (err) {
      console.warn('Firebase update error:', err);
    }
  };

  // Teacher Grades / Re-grades Review Handler (Supports Appeal / Phúc khảo)
  const handleTeacherGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingReview) return;

    const isPassed = gradeStatus === 'completed';
    const isRegrade = gradingReview.score !== undefined || gradingReview.status === 'completed';

    const updated: ReviewItem = {
      ...gradingReview,
      status: gradeStatus,
      score: isPassed ? Number(gradeScore) : undefined,
      feedback: gradeFeedback.trim() || (isPassed ? (isRegrade ? 'Đã chấm lại bài phúc khảo: Đạt tiêu chuẩn xuất sắc!' : 'Bài viết đạt yêu cầu, tư duy tốt!') : 'Em hãy đọc lại nhận xét và bổ sung chi tiết nhé.'),
      teacherName: currentUser.name,
      urgent: !isPassed
    };

    setReviews(prev => prev.map(r => (r.id === gradingReview.id ? updated : r)));

    // Update reader if opened
    if (readingReview && readingReview.id === gradingReview.id) {
      setReadingReview(updated);
    }

    // Notification to Student
    const studentNotif: AppNotification = {
      id: `notif-grade-stud-${Date.now()}`,
      targetRole: 'student',
      targetUserId: gradingReview.studentId,
      title: isPassed
        ? (isRegrade ? `Kết quả chấm lại / Phúc khảo: ${gradeScore}/10 ⭐` : `Chúc mừng! Cô giáo đã chấm ${gradeScore} điểm ⭐`)
        : `Yêu cầu chỉnh sửa bài viết ⚠️`,
      message: `${currentUser.name} đã ${isRegrade ? 'đánh giá lại' : 'nhận xét'} bài "${gradingReview.title}": "${gradeFeedback || (isPassed ? 'Đạt chuẩn' : 'Cần sửa đổi')}"`,
      timestamp: 'Vừa xong',
      read: false,
      type: isPassed ? 'review_graded' : 'revision_requested',
      relatedReviewId: gradingReview.id
    };

    // Notification to Parent
    const parentNotif: AppNotification = {
      id: `notif-grade-par-${Date.now()}`,
      targetRole: 'parent',
      title: isPassed
        ? (isRegrade ? `Kết quả chấm lại bài của con: ${gradeScore}/10 ⭐` : `Kết quả bài học của con: ${gradeScore}/10 ⭐`)
        : `Thông báo sửa bài học của con ⚠️`,
      message: `Giáo viên ${currentUser.name} vừa ${isRegrade ? 'chấm lại/đánh giá' : 'đánh giá'} bài "${gradingReview.title}" của ${gradingReview.studentName}.`,
      timestamp: 'Vừa xong',
      read: false,
      type: isPassed ? 'review_graded' : 'revision_requested',
      relatedReviewId: gradingReview.id
    };

    setNotifications([studentNotif, parentNotif, ...notifications]);
    const gradedId = gradingReview.id;
    setGradingReview(null);
    setGradeFeedback('');
    showToast(`✅ Đã đồng bộ điểm ${isRegrade ? '(Chấm lại / Phúc khảo)' : ''} & nhận xét lên Cloud! Học sinh & Ba mẹ thấy kết quả ngay.`);

    try {
      await updateReviewInFirestore(gradedId, updated);
      await createNotificationInFirestore(studentNotif);
      await createNotificationInFirestore(parentNotif);
    } catch (err) {
      console.warn('Firebase grade update error:', err);
    }
  };

  // Parent Cheer / Reaction Handler
  const handleParentCheer = async (reviewId: string, reactionText: string, customComment?: string) => {
    const commentToSend = customComment?.trim() || parentCommentInput.trim();

    const updatedFields = {
      parentReaction: reactionText,
      parentComment: commentToSend || undefined
    };

    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? {
              ...r,
              parentReaction: reactionText,
              parentComment: commentToSend || r.parentComment
            }
          : r
      )
    );

    // Update reader if currently opened
    if (readingReview && readingReview.id === reviewId) {
      setReadingReview({
        ...readingReview,
        parentReaction: reactionText,
        parentComment: commentToSend || readingReview.parentComment
      });
    }

    const cheeredReview = reviews.find(r => r.id === reviewId);
    let cheerNotif: AppNotification | null = null;
    if (cheeredReview) {
      cheerNotif = {
        id: `notif-cheer-${Date.now()}`,
        targetRole: 'student',
        targetUserId: cheeredReview.studentId,
        title: `Ba mẹ đã gửi lời động viên! ${reactionText}`,
        message: commentToSend
          ? `Phụ huynh nhắn: "${commentToSend}"`
          : `Ba mẹ rất tự hào về bài viết "${cheeredReview.title}" của bạn!`,
        timestamp: 'Vừa xong',
        read: false,
        type: 'parent_cheer',
        relatedReviewId: reviewId
      };
      setNotifications([cheerNotif, ...notifications]);
    }

    setParentCommentInput('');
    showToast(`❤️ Đã gửi lời động viên "${reactionText}" lên Firebase! Con đã nhận được thông báo.`);

    try {
      await updateReviewInFirestore(reviewId, updatedFields);
      if (cheerNotif) {
        await createNotificationInFirestore(cheerNotif);
      }
    } catch (err) {
      console.warn('Firebase cheer error:', err);
    }
  };

  // Open review in reader directly
  const handleOpenReviewReader = (rev: ReviewItem) => {
    setReadingReview(rev);
  };

  // Open review from notification click
  const handleNotificationClick = async (notif: AppNotification) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setShowNotifDropdown(false);

    try {
      await markNotificationReadInFirestore(notif.id);
    } catch (err) {
      console.warn('Mark notif read error:', err);
    }

    if (notif.relatedReviewId) {
      const targetRev = reviews.find(r => r.id === notif.relatedReviewId);
      if (targetRev) {
        setReadingReview(targetRev);
        return;
      }
    }

    if (currentUser.role === 'teacher') setCurrentTab('grading');
    else if (currentUser.role === 'parent') setCurrentTab('parent_feed');
    else setCurrentTab('reviews');
  };

  // Filtered reviews
  const searchedReviews = reviews.filter(r => {
    const match =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.myText.toLowerCase().includes(searchQuery.toLowerCase());
    if (!match) return false;
    if (reviewFilter === 'all') return true;
    if (reviewFilter === 'needs_revision') return r.status === 'needs_revision';
    if (reviewFilter === 'completed') return r.status === 'completed';
    if (reviewFilter === 'reviewing') return r.status === 'reviewing';
    return true;
  });

  const unreadNotifCount = notifications.filter(
    n => !n.read && (n.targetRole === currentUser.role || n.targetRole === 'all')
  ).length;

  const needsAttentionCount = reviews.filter(
    r => r.status === 'needs_revision' && (currentUser.role !== 'student' || r.studentId === currentUser.id)
  ).length;

  const pendingGradingCount = reviews.filter(r => r.status === 'reviewing').length;

  // Dynamic font sizing classes
  const fontScaleClass =
    appFontSize === 'xlarge'
      ? 'text-lg [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_p]:text-base [&_.text-xs]:text-sm [&_.text-sm]:text-base'
      : appFontSize === 'large'
      ? 'text-base [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_p]:text-base [&_.text-xs]:text-sm [&_.text-sm]:text-base'
      : '';

  return (
    <div id="app-root" className={`min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased ${fontScaleClass}`}>
      {/* TOAST ALERT */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 max-w-md"
        >
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm font-semibold leading-snug">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-auto p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <header
        id="main-header"
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white border-b border-slate-200 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            id="mobile-menu-button"
            aria-label="Mở menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl tracking-wider shadow-sm shadow-blue-300">
            LR
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight leading-none flex items-center gap-2">
              <span>LEARN & REVIEW</span>
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Think • Write • Grow • Connect
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Global Font Size Switcher for Readability */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200" title="Chỉnh cỡ chữ toàn bộ ứng dụng">
            <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-blue-600" /> Cỡ chữ:
            </span>
            <button
              onClick={() => {
                setAppFontSize('normal');
                showToast('🔤 Đã chuyển cỡ chữ Chuẩn (16px)');
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                appFontSize === 'normal' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chuẩn
            </button>
            <button
              onClick={() => {
                setAppFontSize('large');
                showToast('🔤 Đã tăng cỡ chữ Lớn (+15%)');
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                appFontSize === 'large' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lớn (A+)
            </button>
            <button
              onClick={() => {
                setAppFontSize('xlarge');
                showToast('🔤 Đã tăng cỡ chữ Rất Lớn (+30%)');
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                appFontSize === 'xlarge' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rất Lớn (A++)
            </button>
          </div>

          {/* Firebase Realtime Cloud Sync Status */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs font-bold"
            title="Dữ liệu đồng bộ trực tuyến thời gian thực qua Firebase Firestore giữa Học sinh, Ba mẹ và Giáo viên"
          >
            <Cloud className={`w-3.5 h-3.5 ${firebaseStatus === 'syncing' ? 'animate-bounce text-blue-600' : 'text-emerald-600'}`} />
            <span>{firebaseStatus === 'syncing' ? 'Đang đồng bộ...' : 'Firebase Cloud Sync'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          {/* Quick Guide */}
          <button
            id="btn-login-guide"
            onClick={() => setShowLoginGuide(true)}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-xs font-bold transition border border-blue-200 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Cách xem bài & Gửi Phụ huynh/GV</span>
          </button>

          {/* Student Gamification Points / Streak (Shown when Student) */}
          {currentUser.role === 'student' && (
            <div className="flex gap-2 sm:gap-4 items-center bg-slate-100 px-3 sm:px-4 py-1.5 rounded-full border border-slate-200">
              <button
                onClick={() => setCurrentTab('rewards')}
                className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer"
                title="Cửa hàng phần thưởng"
                id="header-points-badge"
              >
                <span className="text-amber-500 font-bold text-lg leading-none">⭐</span>
                <span className="text-sm font-extrabold text-slate-800">{points} Pts</span>
              </button>
              <div className="w-[1px] h-4 bg-slate-300"></div>
              <div className="flex items-center gap-1.5" id="header-streak-badge">
                <span className="text-orange-500 font-bold text-lg leading-none">🔥</span>
                <span className="text-sm font-extrabold text-slate-800">{streakDays} Ngày</span>
              </div>
            </div>
          )}

          {/* Notification Bell with Popover */}
          <div className="relative">
            <button
              id="btn-notifications-bell"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Thông báo tương tác"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifDropdown && (
              <div
                id="notif-dropdown"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-3.5 z-50 animate-in fade-in duration-150"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="font-extrabold text-slate-900 text-sm">Hộp thông báo kết nối</span>
                  </div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {currentUser.role === 'teacher' ? 'Giáo viên' : currentUser.role === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.filter(n => n.targetRole === currentUser.role || n.targetRole === 'all').length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      Không có thông báo mới nào.
                    </div>
                  ) : (
                    notifications
                      .filter(n => n.targetRole === currentUser.role || n.targetRole === 'all')
                      .map(notif => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-slate-50 transition flex items-start gap-3 cursor-pointer ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-base">
                            {notif.type === 'review_submitted' ? '📝' : notif.type === 'review_graded' ? '⭐' : notif.type === 'parent_cheer' ? '❤️' : '🔔'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-snug">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-xs text-slate-400 font-medium mt-1 block">
                              {notif.timestamp} {notif.relatedReviewId ? '• Nhấn để đọc bài viết 📖' : ''}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      showToast('✅ Đã đánh dấu đọc tất cả thông báo!');
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Đánh dấu đã đọc tất cả
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Switcher Pill */}
          <div className="relative flex items-center gap-2">
            {/* Quick Gmail Login Trigger Button */}
            <button
              id="btn-quick-gmail-login"
              onClick={() => setShowAuthModal(true)}
              className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs transition cursor-pointer"
              title="Đăng nhập tài khoản Gmail / Google để lưu bài viết vĩnh viễn"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{currentUser.email ? 'Đổi Gmail' : 'Đăng nhập Gmail'}</span>
            </button>

            <button
              id="btn-user-profile-menu"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full border border-slate-200 transition cursor-pointer"
              title="Đổi vai trò (Học sinh / Giáo viên / Phụ huynh) hoặc đăng nhập tài khoản khác"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-2xs ${
                  currentUser.role === 'teacher'
                    ? 'bg-purple-600'
                    : currentUser.role === 'parent'
                    ? 'bg-rose-600'
                    : 'bg-blue-600'
                }`}
              >
                {currentUser.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-extrabold text-slate-900 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  {currentUser.email && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title={`Đã liên kết ${currentUser.email}`} />
                  )}
                </div>
                <p className="text-xs text-blue-600 font-bold leading-tight">
                  {currentUser.role === 'teacher' ? '👩‍🏫 Giáo viên' : currentUser.role === 'parent' ? '👨‍👩‍👧 Phụ huynh' : `🎓 ${currentUser.class}`}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleSwitcher && (
              <div
                id="role-switcher-menu"
                className="absolute right-0 mt-2 top-full w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Tài khoản & Vai trò</h4>
                    <p className="text-xs text-slate-400">
                      {currentUser.email ? `Đã đăng nhập: ${currentUser.email}` : 'Tự động lưu trạng thái đăng nhập'}
                    </p>
                  </div>
                  <button onClick={() => setShowRoleSwitcher(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Primary Action: Google / Gmail login */}
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setShowRoleSwitcher(false);
                      setShowAuthModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl shadow-md shadow-blue-500/20 text-sm transition cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Đăng nhập Gmail / Google</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5">
                    Đăng nhập 1 lần, hệ thống tự nhớ tên và email cho các lần sau.
                  </p>
                </div>

                {/* Preset accounts */}
                <div className="flex flex-col gap-2 mb-4">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Hoặc chọn tài khoản mẫu trải nghiệm nhanh:
                  </span>
                  {PRESET_USERS.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition text-left cursor-pointer ${
                        currentUser.id === u.id
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-sm ${
                            u.role === 'teacher' ? 'bg-purple-600' : u.role === 'parent' ? 'bg-rose-600' : 'bg-blue-600'
                          }`}
                        >
                          {u.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">
                            {u.role === 'teacher' ? '👩‍🏫 Giáo viên chấm bài' : u.role === 'parent' ? '👨‍👩‍👧 Phụ huynh theo dõi' : `🎓 Học sinh (${u.class})`}
                          </p>
                        </div>
                      </div>
                      {currentUser.id === u.id && <Check className="w-5 h-5 text-blue-600" />}
                    </button>
                  ))}
                </div>

                {/* Custom User Form */}
                <form onSubmit={handleCustomLogin} className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Hoặc nhập tên riêng của bạn:
                  </span>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên của bạn..."
                    value={customLoginName}
                    onChange={e => setCustomLoginName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium"
                    required
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomLoginRole('student')}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        customLoginRole === 'student'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      Học sinh
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomLoginRole('teacher')}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        customLoginRole === 'teacher'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      Giáo viên
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomLoginRole('parent')}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        customLoginRole === 'parent'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      Phụ huynh
                    </button>
                  </div>
                  {customLoginRole === 'student' && (
                    <input
                      type="text"
                      placeholder="Lớp học (Ví dụ: Lớp 7A1, Lớp 8B...)"
                      value={customLoginClass}
                      onChange={e => setCustomLoginClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                    />
                  )}
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Bắt đầu sử dụng với tên này
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY CONTENT CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside
          id="main-sidebar"
          className={`
            fixed md:static inset-y-0 left-0 z-40 w-64 sm:w-72 bg-white border-r border-slate-200 p-5 flex flex-col gap-2 transition-transform duration-200 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Danh mục điều hướng</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-3.5 py-2.5 bg-slate-100 rounded-2xl mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">Không gian hiện tại</p>
              <p className="text-sm font-extrabold text-slate-800">
                {currentUser.role === 'teacher' ? '👩‍🏫 Bàn làm việc Giáo viên' : currentUser.role === 'parent' ? '👨‍👩‍👧 Sổ liên lạc Phụ huynh' : '🎓 Học tập & Tích điểm'}
              </p>
            </div>
            <button
              onClick={() => setShowRoleSwitcher(true)}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Đổi
            </button>
          </div>

          <nav className="flex flex-col gap-1.5" id="nav-container">
            <button
              id="nav-dashboard"
              onClick={() => {
                setCurrentTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-xl">🏠</span>
              <span>Tổng quan chung</span>
            </button>

            <button
              id="nav-reviews"
              onClick={() => {
                setCurrentTab('reviews');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'reviews'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-xl">📚</span>
                <span>Tất cả bài Review</span>
              </div>
              {needsAttentionCount > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {needsAttentionCount}
                </span>
              )}
            </button>

            <button
              id="nav-teacher-grading"
              onClick={() => {
                setCurrentTab('grading');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'grading'
                  ? 'bg-purple-50 text-purple-700 shadow-xs border border-purple-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-xl">👩‍🏫</span>
                <span>Góc Giáo Viên Chấm Bài</span>
              </div>
              {pendingGradingCount > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingGradingCount}
                </span>
              )}
            </button>

            <button
              id="nav-parent-feed"
              onClick={() => {
                setCurrentTab('parent_feed');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'parent_feed'
                  ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-xl">👨‍👩‍👧</span>
              <span>Sổ Liên Lạc Ba Mẹ</span>
            </button>

            <button
              id="nav-tasks"
              onClick={() => {
                setCurrentTab('tasks');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'tasks'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-xl">📋</span>
                <span>Nhiệm vụ bài đọc</span>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {tasks.filter(t => !t.completed).length}
              </span>
            </button>

            <button
              id="nav-rewards"
              onClick={() => {
                setCurrentTab('rewards');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'rewards'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-xl">🎁</span>
              <span>Đổi phần thưởng</span>
            </button>
          </nav>

          {/* Slogan Quote Card */}
          <div className="mt-auto p-4 bg-indigo-950 rounded-2xl text-white relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <p className="text-xs uppercase font-extrabold text-indigo-300 tracking-wider">
                  Triết lý đọc sâu
                </p>
              </div>
              <p className="text-xs sm:text-sm italic leading-relaxed text-indigo-100 font-medium">
                &ldquo;Đừng chỉ đọc. Hãy nhớ. Hãy suy nghĩ. Hãy kể lại bằng chính lời của mình.&rdquo;
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-600/30 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* MAIN VIEW AREA */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-[calc(100vh-65px)] flex flex-col gap-6 sm:gap-8">
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <>
              {/* Header Greeting & Action */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {currentUser.role === 'student' ? 'Học sinh đang hoạt động' : currentUser.role === 'teacher' ? 'Bảng điều khiển Giáo viên' : 'Giao diện Phụ huynh'}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">• {currentUser.class}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Xin chào, {currentUser.name}! 👋
                  </h2>
                  <p className="text-slate-600 mt-1 text-sm sm:text-base leading-relaxed">
                    {currentUser.role === 'student'
                      ? 'Khi bạn viết bài review, bài sẽ tự động hiển thị với tên bạn và gửi thông báo tới Giáo viên & Ba mẹ.'
                      : currentUser.role === 'teacher'
                      ? 'Bạn có thể xem bài của tất cả học sinh, chấm điểm và gửi lời nhận xét trực tiếp.'
                      : 'Theo dõi tiến trình bài đọc, điểm thưởng và nhận xét của giáo viên dành cho con.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setShowLoginGuide(true)}
                    className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-2xl font-bold border border-slate-200 shadow-xs flex items-center gap-2 transition cursor-pointer text-sm"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Hướng dẫn xem bài dài</span>
                  </button>

                  <button
                    id="btn-create-review"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-6 py-3 rounded-2xl font-extrabold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer text-sm sm:text-base"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    <span>TẠO REVIEW MỚI</span>
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4 hover:border-slate-300 transition">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">
                      📚
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Tiến độ bài học
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Chương sách hoàn thành</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      12 Chương
                    </h3>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                      <span>Mục tiêu tuần</span>
                      <span className="text-amber-600 font-extrabold">65%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[65%] rounded-full transition-all duration-500"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4 hover:border-slate-300 transition">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl">
                      ✍️
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Tổng số Review
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Đã nộp và duyệt</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {reviews.length} Bài
                    </h3>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1.5">
                      <span>Tỷ lệ hoàn thành</span>
                      <span className="text-emerald-600 font-extrabold">85%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[85%] rounded-full transition-all duration-500"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4 hover:border-slate-300 transition sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl">
                      🔔
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Kết nối 3 bên
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Học sinh • GV • Ba mẹ</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      100% Đồng bộ
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-xs font-bold text-blue-600">
                    <span className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg">
                      <Check className="w-4 h-4" /> Báo GV
                    </span>
                    <span className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg">
                      <Check className="w-4 h-4" /> Báo Ba Mẹ
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Split: Recent Reviews & Live Tri-Party Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 cols): Reviews Stream */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                  <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 text-base sm:text-lg">Bài Review bài học mới nhất</h3>
                      <p className="text-xs text-slate-500">Nhấn vào bài viết hoặc nút "Đọc chi tiết" để xem toàn bộ nội dung</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('reviews')}
                      className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      Xem tất cả ({reviews.length}) <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
                    {reviews.slice(0, 4).map(rev => (
                      <div
                        key={rev.id}
                        className={`p-5 rounded-3xl border transition flex flex-col gap-3.5 hover:shadow-sm ${
                          rev.status === 'needs_revision'
                            ? 'bg-orange-50/50 border-orange-200'
                            : rev.status === 'completed'
                            ? 'bg-slate-50/70 border-slate-200'
                            : 'bg-blue-50/40 border-blue-200'
                        }`}
                      >
                        {/* Student Author Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                              {rev.studentAvatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-tight">
                                {rev.studentName}
                                <span className="ml-2 font-normal text-slate-500 text-xs">({rev.studentClass})</span>
                              </p>
                              <p className="text-xs text-slate-400">Nộp lúc {rev.submittedAt}</p>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-xl ${
                              rev.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rev.status === 'needs_revision'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {rev.status === 'completed'
                              ? `⭐ Đạt ${rev.score}/10`
                              : rev.status === 'needs_revision'
                              ? '⚠️ Cần sửa lại'
                              : '⏳ Đang chấm'}
                          </span>
                        </div>

                        {/* Title & Subject */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg">
                              {rev.subject}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">• {rev.chapter}</span>
                          </div>
                          <h4
                            onClick={() => handleOpenReviewReader(rev)}
                            className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                          >
                            {rev.title}
                          </h4>
                          <p className="text-sm text-slate-700 mt-2 line-clamp-3 italic bg-white/80 p-3.5 rounded-2xl border border-slate-200/60 leading-relaxed">
                            &ldquo;{rev.myText}&rdquo;
                          </p>
                        </div>

                        {/* Teacher Feedback pill */}
                        {rev.feedback && (
                          <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-start gap-2.5">
                            <span className="text-base">👩‍🏫</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800">
                                {rev.teacherName || 'Giáo viên bộ môn'}:
                              </p>
                              <p className="text-xs sm:text-sm text-slate-600 italic leading-snug">{rev.feedback}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions: Prominent View Full Review button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 flex-wrap gap-2">
                          <button
                            onClick={() => handleOpenReviewReader(rev)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>ĐỌC TOÀN BỘ BÀI VIẾT (XEM BÀI DÀI)</span>
                          </button>

                          <div className="flex items-center gap-2 ml-auto">
                            {currentUser.role === 'student' && (
                              <button
                                onClick={() => setEditingReview(rev)}
                                className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-xl font-bold border border-orange-200 transition flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Sửa &amp; Nộp lại
                              </button>
                            )}

                            {currentUser.role === 'teacher' && (
                              <button
                                onClick={() => {
                                  setGradingReview(rev);
                                  setGradeScore(rev.score || 9.0);
                                  setGradeFeedback(rev.feedback || '');
                                  setGradeStatus(rev.status === 'needs_revision' ? 'needs_revision' : 'completed');
                                }}
                                className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{rev.status === 'completed' ? 'Chấm lại bài' : 'Chấm điểm'}</span>
                              </button>
                            )}

                            {currentUser.role === 'parent' && (
                              <button
                                onClick={() => handleParentCheer(rev.id, '❤️ Rất tự hào về con!')}
                                className="bg-rose-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold hover:bg-rose-700 transition flex items-center gap-1 cursor-pointer"
                              >
                                <Heart className="w-3.5 h-3.5" /> Thả tim
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right (1 col): Streak Widget & Guide */}
                <div className="flex flex-col gap-6">
                  {/* Streak & Checkin */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-base">Chuỗi ngày học liên tục</h3>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        🔥 7 Ngày liên tiếp
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'].map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div
                            className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-bold ${
                              i <= 5 ? 'bg-emerald-500 text-white' : 'bg-slate-100 border border-slate-200 text-slate-400'
                            }`}
                          >
                            {i <= 5 ? '✓' : '?'}
                          </div>
                          <span className="text-xs font-semibold text-slate-400">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tri-Party Notification Status Card */}
                  <div className="bg-linear-to-br from-indigo-950 to-blue-950 rounded-3xl p-6 text-white shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300">
                        Quy trình tự động
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>
                    <h4 className="font-black text-base sm:text-lg text-white leading-snug">
                      Hệ thống tự động thông báo khi có Review mới
                    </h4>
                    <ul className="text-xs sm:text-sm text-indigo-100 space-y-3">
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-black text-base leading-none">1.</span>
                        <span>
                          <strong>Học sinh nộp bài</strong>: Tên, lớp và nội dung bài viết lập tức xuất hiện trên hệ thống.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-amber-400 font-black text-base leading-none">2.</span>
                        <span>
                          <strong>Báo Giáo viên</strong>: Báo chuông đỏ và hiện ngay trong danh sách chấm điểm của cô.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-rose-400 font-black text-base leading-none">3.</span>
                        <span>
                          <strong>Báo Ba Mẹ</strong>: Phụ huynh nhận tin báo qua sổ liên lạc điện tử kèm điểm & lời chúc.
                        </span>
                      </li>
                    </ul>

                    <button
                      onClick={() => setShowLoginGuide(true)}
                      className="mt-1 bg-white text-indigo-950 font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl hover:bg-indigo-50 transition text-center cursor-pointer"
                    >
                      Xem hướng dẫn chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: REVIEWS ARCHIVE */}
          {currentTab === 'reviews' && (
            <div className="flex flex-col gap-6" id="view-reviews">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Kho bài Review ({searchedReviews.length} bài)
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base mt-0.5">
                    Đọc toàn bộ cảm nhận bài học, tóm tắt sách của học sinh kèm phản hồi chính thức từ giáo viên.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-extrabold shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  <Plus className="w-5 h-5" /> Viết Review mới
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3.5 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên học sinh, môn học, bài..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider shrink-0">Lọc:</span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'needs_revision', label: 'Cần sửa' },
                    { id: 'reviewing', label: 'Chờ duyệt' },
                    { id: 'completed', label: 'Đã đạt' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setReviewFilter(f.id)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                        reviewFilter === f.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchedReviews.map(r => (
                  <div
                    key={r.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Author & status badge */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center">
                            {r.studentAvatar}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900">{r.studentName}</span>
                            <span className="text-xs text-slate-400 ml-1.5 font-medium">({r.studentClass})</span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-extrabold px-3 py-1.5 rounded-xl ${
                            r.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'needs_revision'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {r.status === 'completed'
                            ? `⭐ Đạt ${r.score}/10`
                            : r.status === 'needs_revision'
                            ? '⚠️ Cần sửa lại'
                            : '⏳ Đang chấm'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-lg">
                          {r.subject}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{r.chapter}</span>
                      </div>

                      <h3
                        onClick={() => handleOpenReviewReader(r)}
                        className="text-lg font-bold text-slate-900 leading-snug hover:text-blue-600 transition cursor-pointer"
                      >
                        {r.title}
                      </h3>

                      {/* Text Snippet with View More button */}
                      <div className="mt-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-sm text-slate-700 font-normal leading-relaxed line-clamp-3">
                          &ldquo;{r.myText}&rdquo;
                        </p>
                        {r.reflection && (
                          <p className="text-xs sm:text-sm text-indigo-800 mt-2.5 font-medium pt-2 border-t border-slate-200/60">
                            💡 <strong>Cảm nhận:</strong> {r.reflection}
                          </p>
                        )}
                      </div>

                      {/* Teacher Feedback */}
                      {r.feedback && (
                        <div className="mt-3 p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                          <span className="text-sm">👩‍🏫</span>
                          <div>
                            <p className="text-xs font-bold text-blue-950">
                              {r.teacherName || 'Giáo viên hướng dẫn'}:
                            </p>
                            <p className="text-xs sm:text-sm text-slate-700 italic">&ldquo;{r.feedback}&rdquo;</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom controls */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenReviewReader(r)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <BookOpen className="w-4 h-4" /> Đọc toàn bộ bài viết
                      </button>

                      <div className="flex items-center gap-2">
                        {currentUser.role === 'teacher' && (
                          <button
                            onClick={() => {
                              setGradingReview(r);
                              setGradeScore(r.score || 9.0);
                              setGradeFeedback(r.feedback || '');
                              setGradeStatus(r.status === 'needs_revision' ? 'needs_revision' : 'completed');
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                          >
                            {r.status === 'completed' ? 'Chấm lại bài' : 'Chấm điểm'}
                          </button>
                        )}

                        {currentUser.role === 'parent' && (
                          <button
                            onClick={() => handleParentCheer(r.id, '❤️ Ba mẹ rất khen ngợi!')}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                          >
                            Động viên
                          </button>
                        )}

                        {currentUser.role === 'student' && (
                          <button
                            onClick={() => setEditingReview(r)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa &amp; Nộp lại</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TEACHER GRADING PORTAL */}
          {currentTab === 'grading' && (
            <div className="flex flex-col gap-6" id="view-teacher-grading">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-md">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-purple-800 text-purple-200 text-xs font-extrabold px-3 py-0.5 rounded-full uppercase">
                      Khu vực Chuyên môn
                    </span>
                    <span className="text-xs text-purple-300 font-bold">GV: {currentUser.name}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Hòm thư duyệt & Chấm điểm Review</h2>
                  <p className="text-purple-200 text-sm sm:text-base mt-1">
                    Mỗi khi học sinh nộp bài mới hoặc nộp bài sửa, bài sẽ hiển thị ngay tại đây để cô chấm và nhận xét.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-900/90 px-5 py-3 rounded-2xl text-center border border-purple-700">
                    <p className="text-xs text-purple-300 font-bold">Chờ duyệt</p>
                    <p className="text-2xl font-black text-amber-300">{pendingGradingCount} bài</p>
                  </div>
                  <div className="bg-purple-900/90 px-5 py-3 rounded-2xl text-center border border-purple-700">
                    <p className="text-xs text-purple-300 font-bold">Cần sửa</p>
                    <p className="text-2xl font-black text-rose-300">{needsAttentionCount} bài</p>
                  </div>
                </div>
              </div>

              {/* Reviews needing teacher action */}
              <div className="grid grid-cols-1 gap-5">
                {reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-purple-300 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                          {rev.studentAvatar}
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900 leading-tight">
                            {rev.studentName} <span className="text-xs font-medium text-slate-500">• {rev.studentClass}</span>
                          </p>
                          <p className="text-xs text-slate-400">Nộp lúc {rev.submittedAt}</p>
                        </div>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-xl ml-auto md:ml-0 ${
                            rev.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rev.status === 'needs_revision'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-purple-100 text-purple-800 animate-pulse'
                          }`}
                        >
                          {rev.status === 'completed' ? `⭐ Đã chấm: ${rev.score}/10` : rev.status === 'needs_revision' ? '⚠️ Yêu cầu sửa' : '⏳ Cần chấm điểm'}
                        </span>
                      </div>

                      <h4
                        onClick={() => handleOpenReviewReader(rev)}
                        className="text-lg font-bold text-slate-900 mt-2 hover:text-purple-700 transition cursor-pointer"
                      >
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg mr-2">
                          {rev.subject}
                        </span>
                        {rev.title}
                      </h4>

                      <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed line-clamp-3">
                        &ldquo;{rev.myText}&rdquo;
                      </p>

                      {rev.feedback && (
                        <p className="text-xs sm:text-sm text-purple-900 mt-2.5 font-medium bg-purple-50 p-3 rounded-2xl border border-purple-100">
                          💬 <strong>Nhận xét hiện tại của cô:</strong> {rev.feedback}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 justify-center">
                      <button
                        onClick={() => handleOpenReviewReader(rev)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span>Đọc toàn bộ bài dài</span>
                      </button>

                      <button
                        onClick={() => {
                          setGradingReview(rev);
                          setGradeScore(rev.score || 9.0);
                          setGradeFeedback(rev.feedback || '');
                          setGradeStatus(rev.status === 'needs_revision' ? 'needs_revision' : 'completed');
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{rev.status === 'completed' ? 'CHẤM LẠI BÀI (PHÚC KHẢO)' : 'CHẤM ĐIỂM / NHẬN XÉT'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PARENT FEED */}
          {currentTab === 'parent_feed' && (
            <div className="flex flex-col gap-6" id="view-parent-feed">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-rose-950 via-rose-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-md">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-rose-700/80 text-rose-100 text-xs font-extrabold px-3 py-0.5 rounded-full uppercase">
                      Sổ Liên Lạc Điện Tử
                    </span>
                    <span className="text-xs text-rose-200 font-bold">Đang theo dõi: Em Minh Anh (Lớp 7A1)</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Nhật Ký Học Tập Của Con</h2>
                  <p className="text-rose-100 text-sm sm:text-base mt-1">
                    Ba mẹ nhận thông báo thời gian thực mỗi khi con viết bài review, xem điểm và nhận xét từ thầy cô.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-black/30 backdrop-blur-xs px-5 py-3 rounded-2xl text-center border border-white/10">
                    <p className="text-xs text-rose-200 font-bold">Điểm thưởng của con</p>
                    <p className="text-2xl font-black text-amber-300">{points} ⭐</p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-xs px-5 py-3 rounded-2xl text-center border border-white/10">
                    <p className="text-xs text-rose-200 font-bold">Chuỗi chuyên cần</p>
                    <p className="text-2xl font-black text-emerald-300">{streakDays} ngày 🔥</p>
                  </div>
                </div>
              </div>

              {/* Child's Learning Timeline */}
              <div className="flex flex-col gap-5">
                <h3 className="font-black text-slate-900 text-lg">Dòng hoạt động đọc sách & review của con</h3>
                {reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col gap-4 hover:border-rose-300 transition"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl font-bold text-rose-700">
                          📖
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                              {rev.subject}
                            </span>
                            <h4
                              onClick={() => handleOpenReviewReader(rev)}
                              className="text-base sm:text-lg font-bold text-slate-900 hover:text-rose-700 cursor-pointer"
                            >
                              {rev.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Thời gian nộp: {rev.submittedAt}</p>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-extrabold px-3 py-1.5 rounded-xl ${
                          rev.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.status === 'needs_revision'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rev.status === 'completed'
                          ? `⭐ Điểm cô chấm: ${rev.score}/10`
                          : rev.status === 'needs_revision'
                          ? '⚠️ Cô giáo nhờ ba mẹ nhắc con sửa'
                          : '⏳ Đang chờ cô chấm'}
                      </span>
                    </div>

                    {/* Child's written text */}
                    <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-slate-700">✍️ Bài viết của con:</p>
                        <button
                          onClick={() => handleOpenReviewReader(rev)}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Xem toàn bộ bài dài
                        </button>
                      </div>
                      <p className="text-sm text-slate-800 italic leading-relaxed line-clamp-3">&ldquo;{rev.myText}&rdquo;</p>
                      {rev.reflection && (
                        <p className="text-xs sm:text-sm text-indigo-800 mt-2.5 font-medium pt-2 border-t border-slate-200/60">
                          💡 <strong>Bài học con rút ra:</strong> {rev.reflection}
                        </p>
                      )}
                    </div>

                    {/* Teacher feedback to parent */}
                    {rev.feedback && (
                      <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-start gap-3">
                        <span className="text-lg">👩‍🏫</span>
                        <div>
                          <p className="text-xs font-bold text-purple-950">
                            Nhận xét từ giáo viên ({rev.teacherName || 'Cô giáo'}):
                          </p>
                          <p className="text-sm text-purple-800 mt-0.5">&ldquo;{rev.feedback}&rdquo;</p>
                        </div>
                      </div>
                    )}

                    {/* Parent interactive cheering bar */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        <span className="text-xs font-bold text-slate-500">Động viên con:</span>
                        <button
                          onClick={() => handleParentCheer(rev.id, '❤️ Tự hào về con lắm!')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
                        >
                          ❤️ Tự hào về con
                        </button>
                        <button
                          onClick={() => handleParentCheer(rev.id, '🌟 Con viết rất sâu sắc!')}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition cursor-pointer"
                        >
                          🌟 Khen sáng tạo
                        </button>
                        <button
                          onClick={() => handleParentCheer(rev.id, '🍦 Tối nay mẹ thưởng kem nhé!')}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition cursor-pointer"
                        >
                          🍦 Thưởng quà
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenReviewReader(rev)}
                        className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <Eye className="w-4 h-4" /> Mở chế độ đọc chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TASKS */}
          {currentTab === 'tasks' && (
            <div className="flex flex-col gap-6" id="view-tasks">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Nhiệm vụ bài học mới</h2>
                <p className="text-slate-600 text-sm sm:text-base mt-0.5">
                  Đọc tài liệu và viết review để tích lũy điểm thưởng đổi quà!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-xs flex flex-col justify-between transition ${
                      task.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                          {task.subject}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md uppercase bg-rose-100 text-rose-700">
                          {task.tag}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
                      <p className="text-sm text-slate-500 mt-1.5 font-medium">📖 {task.pages}</p>
                      <p className="text-sm text-slate-600 mt-2 font-medium">
                        ⏰ Hạn chót nộp: <strong>{task.deadline}</strong>
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                        +{task.rewardPoints} Điểm thưởng
                      </span>
                      <button
                        onClick={() => {
                          setTasks(prev =>
                            prev.map(t =>
                              t.id === task.id ? { ...t, completed: !t.completed } : t
                            )
                          );
                          if (!task.completed) {
                            setPoints(p => p + task.rewardPoints);
                            showToast(`✅ Đã hoàn thành nhiệm vụ! +${task.rewardPoints} điểm.`);
                          }
                        }}
                        className={`text-xs sm:text-sm px-5 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                          task.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {task.completed ? 'Đã hoàn thành ✓' : 'Đánh dấu xong'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REWARDS STORE */}
          {currentTab === 'rewards' && (
            <div className="flex flex-col gap-6" id="view-rewards">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 p-6 sm:p-8 rounded-3xl">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
                    Cửa Hàng Phần Thưởng Học Tập 🎁
                  </h2>
                  <p className="text-amber-800 text-sm sm:text-base mt-1">
                    Đổi điểm tích lũy từ các bài review chất lượng để nhận quà tặng hấp dẫn!
                  </p>
                </div>
                <div className="bg-white px-6 py-4 rounded-2xl border border-amber-200 text-center shadow-xs">
                  <p className="text-xs text-slate-500 font-bold">Điểm hiện có của bạn</p>
                  <p className="text-3xl font-black text-amber-600">⭐ {points} Pts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewards.map(rew => (
                  <div
                    key={rew.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl mb-4 border border-amber-100 shadow-2xs">
                        {rew.icon}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{rew.name}</h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{rew.description}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Cần tích lũy</p>
                        <p className="text-base font-black text-slate-900">{rew.cost} Điểm</p>
                      </div>
                      <button
                        onClick={() => {
                          if (points < rew.cost) {
                            showToast(`⚠️ Bạn cần thêm ${rew.cost - points} điểm nữa!`);
                            return;
                          }
                          setPoints(p => p - rew.cost);
                          showToast(`🎁 Đổi thành công quà: ${rew.name}! Mã nhận quà đã lưu vào hồ sơ.`);
                        }}
                        disabled={points < rew.cost}
                        className={`text-xs sm:text-sm px-5 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                          points >= rew.cost
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {points >= rew.cost ? 'ĐỔI NGAY' : 'CHƯA ĐỦ ĐIỂM'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: FULL REVIEW READER (CHO BÀI DÀI VÀ TÙY CHỈNH CỠ CHỮ) */}
      {readingReview && (
        <ReviewReaderModal
          review={readingReview}
          currentUser={currentUser}
          onClose={() => setReadingReview(null)}
          onGrade={rev => {
            setGradingReview(rev);
            setGradeScore(rev.score || 9.0);
            setGradeFeedback(rev.feedback || '');
            setGradeStatus(rev.status === 'needs_revision' ? 'needs_revision' : 'completed');
          }}
          onCheer={handleParentCheer}
          onEdit={rev => setEditingReview(rev)}
          onShowToast={showToast}
        />
      )}

      {/* MODAL 1: CREATE NEW REVIEW */}
      {isCreateModalOpen && (
        <div
          id="modal-create-review"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-slate-900">Viết Bài Review Mới</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Keyboard className="w-3.5 h-3.5" /> Tự gõ bài
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  Tác giả: <strong>{currentUser.name}</strong> ({currentUser.class})
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Anti-Paste & Honesty Banner */}
            <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <p className="font-bold">🛡️ Chế độ luyện gõ & tự học trung thực:</p>
                <p className="text-emerald-700 mt-0.5 leading-relaxed">
                  Học sinh cần <strong>tự dùng bàn phím gõ từng chữ</strong> theo lời văn và cảm nhận của mình. Tính năng sao chép &amp; dán (Copy - Paste) đã được khóa để rèn luyện kỹ năng viết và ghi nhớ bài học.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateReview} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Môn học</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="Ngữ Văn">Ngữ Văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Khoa học Tự nhiên">Khoa học Tự nhiên</option>
                    <option value="Lịch sử & Địa lí">Lịch sử & Địa lí</option>
                    <option value="Sách Kỹ năng sống">Sách Kỹ năng sống</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Chương / Bài</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chương 3, Bài 5..."
                    value={newChapter}
                    onChange={e => setNewChapter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên bài học hoặc sách</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cảm nhận về nhân vật Dế Mèn phiêu lưu ký..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Nội dung tóm tắt &amp; Lời văn của em (Review chi tiết)</span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Khóa Paste 🚫
                    </span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ✍️ Đã gõ: {newText.trim() ? newText.trim().split(/\s+/).length : 0} từ ({newText.length} ký tự)
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder="Em hãy tự gõ bàn phím kể lại những ý chính quan trọng bằng ngôn ngữ của chính em, có thể viết dài nhiều đoạn..."
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  onPaste={e => {
                    e.preventDefault();
                    showToast('⚠️ Không thể dán (Paste): Em hãy tự gõ từng chữ từ bàn phím bằng chính suy nghĩ của mình nhé!');
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    showToast('⚠️ Không thể kéo thả văn bản: Em hãy tự gõ chữ vào ô bài làm nhé!');
                  }}
                  onContextMenu={e => {
                    e.preventDefault();
                    showToast('⚠️ Menu chuột phải đã tắt: Em hãy sử dụng bàn phím để tự gõ bài văn nhé!');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 leading-relaxed font-normal select-text"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Cảm nghĩ hoặc bài học tâm đắc nhất của em</span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Khóa Paste 🚫
                    </span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {newReflection.length} ký tự
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Em rút ra được điều gì áp dụng vào cuộc sống hay học tập?"
                  value={newReflection}
                  onChange={e => setNewReflection(e.target.value)}
                  onPaste={e => {
                    e.preventDefault();
                    showToast('⚠️ Em hãy tự gõ cảm nhận của mình từ bàn phím nhé!');
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    showToast('⚠️ Em hãy tự gõ cảm nhận của mình từ bàn phím nhé!');
                  }}
                  onContextMenu={e => {
                    e.preventDefault();
                    showToast('⚠️ Vui lòng tự đánh máy nội dung bài học!');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 select-text"
                />
              </div>

              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                <span className="text-base">🔔</span>
                <p>
                  Khi bấm <strong>"Nộp bài &amp; Tích điểm"</strong>, bài viết tự gõ của em sẽ được lưu lên đám mây <strong>Firebase</strong>, gửi đồng thời tới <strong>Giáo viên</strong> để chấm điểm và cập nhật lên <strong>Sổ liên lạc của Ba Mẹ</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Nộp bài &amp; Tích 25 điểm ⭐</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT / REVISE REVIEW */}
      {editingReview && (
        <div
          id="modal-edit-review"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase">Chỉnh sửa &amp; Hoàn thiện bài</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{editingReview.title}</h3>
              </div>
              <button
                onClick={() => setEditingReview(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 p-3.5 bg-orange-50 border border-orange-200 rounded-2xl">
              <p className="text-xs font-bold text-orange-950">👩‍🏫 Nhận xét của giáo viên cần khắc phục:</p>
              <p className="text-sm text-orange-800 mt-1 italic">&ldquo;{editingReview.feedback}&rdquo;</p>
            </div>

            {/* Anti-Paste Notice */}
            <div className="mt-3 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Chế độ tự gõ bài bổ sung (Đã khóa chức năng Dán văn bản).</span>
            </div>

            <form onSubmit={handleUpdateReview} className="mt-4 flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Nội dung bài viết bổ sung</label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ✍️ {editingReview.myText ? editingReview.myText.split(/\s+/).length : 0} từ
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={editingReview.myText}
                  onChange={e => setEditingReview({ ...editingReview, myText: e.target.value })}
                  onPaste={e => {
                    e.preventDefault();
                    showToast('⚠️ Không thể dán (Paste): Em hãy tự gõ phần sửa bài bằng bàn phím nhé!');
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    showToast('⚠️ Em hãy tự gõ chữ vào bài sửa nhé!');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 leading-relaxed font-normal select-text"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phần cảm nhận cá nhân bổ sung</label>
                <textarea
                  rows={3}
                  value={editingReview.reflection || ''}
                  onChange={e => setEditingReview({ ...editingReview, reflection: e.target.value })}
                  onPaste={e => {
                    e.preventDefault();
                    showToast('⚠️ Em hãy tự gõ cảm nhận của mình nhé!');
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    showToast('⚠️ Em hãy tự gõ cảm nhận của mình nhé!');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 select-text"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer"
                >
                  Nộp lại bài sửa (+15 điểm) ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TEACHER GRADING DIALOG */}
      {gradingReview && (
        <div
          id="modal-grading-review"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">Góc Giáo Viên Chấm Bài</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{gradingReview.title}</h3>
                <p className="text-xs text-slate-500">
                  Học sinh: <strong>{gradingReview.studentName}</strong> ({gradingReview.studentClass})
                </p>
              </div>
              <button
                onClick={() => setGradingReview(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Student's text */}
            <div className="mt-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 max-h-52 overflow-y-auto">
              <p className="text-xs font-bold text-slate-700 mb-1.5">📖 Bài làm chi tiết của học sinh:</p>
              <p className="text-sm text-slate-800 leading-relaxed italic whitespace-pre-line">&ldquo;{gradingReview.myText}&rdquo;</p>
              {gradingReview.reflection && (
                <p className="text-sm text-indigo-800 mt-3 pt-2 border-t border-slate-200">
                  💡 <strong>Cảm nhận:</strong> {gradingReview.reflection}
                </p>
              )}
            </div>

            <form onSubmit={handleTeacherGrade} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kết quả đánh giá</label>
                  <select
                    value={gradeStatus}
                    onChange={e => setGradeStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none font-bold"
                  >
                    <option value="completed">⭐ Đạt chuẩn (Cho điểm)</option>
                    <option value="needs_revision">⚠️ Yêu cầu học sinh viết lại</option>
                  </select>
                </div>

                {gradeStatus === 'completed' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Điểm số (Thang điểm 10)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={gradeScore}
                      onChange={e => setGradeScore(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-purple-500 font-black"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lời nhận xét & Hướng dẫn của cô giáo
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi nhận xét chi tiết để học sinh và ba mẹ cùng nắm bắt..."
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingReview(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  Gửi Điểm & Báo Học sinh / Phụ huynh 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LOGIN & SHARING GUIDE (HƯỚNG DẪN KHI GỬI CHO NGƯỜI DÙNG & XEM BÀI DÀI) */}
      {showLoginGuide && (
        <div
          id="modal-login-guide"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                  🚀
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">Hướng Dẫn Xem Bài & Kết Nối 3 Bên</h3>
                  <p className="text-xs text-slate-400">Cách hoạt động khi chia sẻ ứng dụng cho Học sinh, Giáo viên & Ba mẹ</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginGuide(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-5 text-slate-700 text-sm leading-relaxed">
              {/* Feature: How to read long reviews */}
              <div className="p-4.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  📖
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-base">Xem nội dung bài review & bài viết dài như thế nào?</h4>
                  <p className="mt-1 text-slate-700 text-xs sm:text-sm leading-relaxed">
                    - Mỗi bài review đều có nút <strong>"Đọc toàn bộ bài viết (Xem bài dài)"</strong> hoặc bấm trực tiếp vào tiêu đề bài viết.<br />
                    - Khung đọc chuyên dụng sẽ mở ra: hiển thị toàn văn, chia đoạn văn bản thoáng mắt, có thanh cuộn mượt mà.<br />
                    - Trong khung đọc có sẵn <strong>nút phóng to/thu nhỏ cỡ chữ (A- / A+)</strong> từ 14px đến 26px giúp người già, ba mẹ, trẻ nhỏ đều đọc rất dễ dàng.<br />
                    - Hỗ trợ nút <strong>"Đọc bài (Giọng nói)" 🔊</strong> để nghe máy đọc bài review bằng tiếng Việt chuẩn!
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-blue-950 text-base">Học sinh đăng nhập và hiển thị bài viết như thế nào?</h4>
                  <p className="mt-1 text-slate-600 text-xs sm:text-sm leading-relaxed">
                    - Người dùng bấm vào góc trên bên phải để chọn tài khoản mẫu (Minh Anh, Đức Huy...) hoặc nhập tên của mình.<br />
                    - Khi bấm <strong>"TẠO REVIEW MỚI"</strong> và nộp bài, hệ thống lập tức gắn <strong>Tên tác giả, Ảnh đại diện, Lớp học và Giờ nộp</strong> vào bài viết.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-purple-950 text-base">Giáo viên nhận thông báo và chấm bài như thế nào?</h4>
                  <p className="mt-1 text-slate-600 text-xs sm:text-sm leading-relaxed">
                    - Giáo viên vào <strong>"Góc Giáo Viên Chấm Bài"</strong> sẽ thấy ngay các bài mới nộp và chuông báo đỏ 🔔.<br />
                    - Giáo viên có thể đọc toàn văn bài viết, cho điểm (1 - 10), viết lời phê hoặc yêu cầu sửa đổi.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 text-base">Ba mẹ (Phụ huynh) theo dõi và nhận thông báo ra sao?</h4>
                  <p className="mt-1 text-slate-600 text-xs sm:text-sm leading-relaxed">
                    - Phụ huynh vào <strong>"Sổ Liên Lạc Ba Mẹ"</strong> để xem con đọc sách gì, viết gì, được cô chấm mấy điểm.<br />
                    - Ba mẹ có thể <strong>"Thả tim ❤️"</strong>, <strong>"Khen ngợi 🌟"</strong> hoặc gửi lời nhắn động viên con.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowLoginGuide(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Đã hiểu, đóng hướng dẫn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: GMAIL & ACCOUNT AUTH MODAL (AUTO-PERSIST ON DEVICE & CLOUD) */}
      <AuthModal
        isOpen={showAuthModal}
        currentUser={currentUser}
        onClose={() => setShowAuthModal(false)}
        onSelectUser={handleSwitchUser}
        onShowToast={showToast}
      />
    </div>
  );
}
