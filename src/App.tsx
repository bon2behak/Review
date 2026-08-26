import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Flame,
  Star,
  Plus,
  Home,
  BookMarked,
  ClipboardList,
  Gift,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Award,
  AlertCircle,
  X,
  Check,
  ChevronRight,
  Share2,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Calendar,
  Layers,
  Menu,
  Bell,
  UserCheck,
  Users,
  GraduationCap,
  Heart,
  Send,
  HelpCircle,
  Smartphone,
  Mail,
  Edit3,
  LogOut,
  RefreshCw,
  Eye,
  CheckCheck
} from 'lucide-react';

// --- TYPES ---
export type UserRole = 'student' | 'teacher' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  class: string;
  studentId?: string; // For parents, indicates their child's ID
  email?: string;
  phone?: string;
}

export interface ReviewItem {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentAvatar: string;
  subject: string;
  title: string;
  chapter: string;
  feedback: string;
  deadline: string;
  status: 'needs_revision' | 'reviewing' | 'completed';
  urgent?: boolean;
  score?: number;
  date: string;
  submittedAt: string;
  myText: string;
  reflection?: string;
  teacherName?: string;
  parentReaction?: string;
  parentComment?: string;
}

export interface TaskItem {
  id: string;
  subject: string;
  title: string;
  pages: string;
  deadline: string;
  rewardPoints: number;
  completed: boolean;
  tag: string;
}

export interface RewardItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  category: string;
  description: string;
  redeemedCount: number;
}

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'review_submitted' | 'review_graded' | 'revision_requested' | 'parent_cheer' | 'system';
  relatedReviewId?: string;
}

// --- INITIAL DATA ---
const PRESET_USERS: UserProfile[] = [
  {
    id: 'usr_student_1',
    name: 'Minh Anh',
    role: 'student',
    class: 'Lớp 7A1',
    avatar: 'MA',
    email: 'minhanh.7a1@school.edu.vn'
  },
  {
    id: 'usr_student_2',
    name: 'Đức Huy',
    role: 'student',
    class: 'Lớp 7A1',
    avatar: 'DH',
    email: 'duchuy.7a1@school.edu.vn'
  },
  {
    id: 'usr_teacher_1',
    name: 'Cô Hoàng Mai',
    role: 'teacher',
    class: 'GVCN & Bộ môn Văn 7A1',
    avatar: 'HM',
    email: 'hoangmai.teacher@school.edu.vn'
  },
  {
    id: 'usr_parent_1',
    name: 'Phụ huynh Minh Anh (Mẹ Lan)',
    role: 'parent',
    class: 'Phụ huynh 7A1',
    studentId: 'usr_student_1',
    avatar: 'ML',
    phone: '0912.xxx.888'
  }
];

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    studentId: 'usr_student_1',
    studentName: 'Minh Anh',
    studentClass: 'Lớp 7A1',
    studentAvatar: 'MA',
    subject: 'Tiếng Anh',
    title: 'Chapter 3: Global Citizens',
    chapter: 'Bài đọc Unit 3',
    feedback: 'Em cần bổ sung thêm phần cảm nhận cá nhân về nhân vật chính nhé.',
    deadline: 'Hôm nay',
    status: 'needs_revision',
    urgent: true,
    date: '24/08/2026',
    submittedAt: '14:30 24/08',
    myText: 'The main character traveled around the world to understand cultural diversity and learn how people in different countries solve global environmental issues...',
    reflection: 'Em thấy câu chuyện rất ý nghĩa về tình bạn toàn cầu và trách nhiệm giữ gìn hành tinh xanh.',
    teacherName: 'Thầy David Wilson'
  },
  {
    id: 'rev-2',
    studentId: 'usr_student_1',
    studentName: 'Minh Anh',
    studentClass: 'Lớp 7A1',
    studentAvatar: 'MA',
    subject: 'Toán học',
    title: 'Bài 5: Tỷ lệ nghịch và ứng dụng thực tế',
    chapter: 'Chương 2: Đại số 7',
    feedback: 'Giải thích phương pháp giải chưa rõ ràng, hãy dùng ngôn ngữ của em.',
    deadline: '2 ngày tới',
    status: 'needs_revision',
    urgent: false,
    date: '23/08/2026',
    submittedAt: '09:15 23/08',
    myText: 'Khi đại lượng này tăng thì đại lượng kia giảm theo tỷ số không đổi. Ví dụ nếu vận tốc tăng gấp đôi thì thời gian di chuyển giảm đi một nửa trên cùng quãng đường...',
    reflection: 'Cần vẽ thêm sơ đồ minh họa giữa đại lượng thời gian và vận tốc.',
    teacherName: 'Thầy Quang'
  },
  {
    id: 'rev-3',
    studentId: 'usr_student_1',
    studentName: 'Minh Anh',
    studentClass: 'Lớp 7A1',
    studentAvatar: 'MA',
    subject: 'Ngữ Văn',
    title: 'Cảm nghĩ về bài thơ "Đồng Dao Mùa Xuân"',
    chapter: 'Văn học trung học',
    feedback: 'Bài viết rất giàu cảm xúc, phân tích hình ảnh người lính trẻ rất sắc sảo và chạm đến trái tim người đọc!',
    deadline: 'Đã hoàn thành',
    status: 'completed',
    score: 9.5,
    date: '20/08/2026',
    submittedAt: '16:00 20/08',
    myText: 'Hình ảnh người lính trẻ mãi mãi tuổi hai mươi nằm lại giữa rừng sâu với chiếc ba lô con cóc và nụ cười hiền hậu làm em xúc động vô cùng...',
    reflection: 'Biết ơn sâu sắc sự hy sinh thầm lặng của các thế hệ cha anh vì nền hòa bình dân tộc.',
    teacherName: 'Cô Hoàng Mai',
    parentReaction: '❤️ Tự hào về con!',
    parentComment: 'Mẹ đọc bài văn con viết mà xúc động quá, cố gắng phát huy con nhé!'
  },
  {
    id: 'rev-4',
    studentId: 'usr_student_2',
    studentName: 'Đức Huy',
    studentClass: 'Lớp 7A1',
    studentAvatar: 'DH',
    subject: 'Khoa học Tự nhiên',
    title: 'Khám phá quá trình quang hợp ở thực vật',
    chapter: 'Sinh học lớp 7',
    feedback: 'Đang đợi cô Hoàng Mai chấm và góp ý.',
    deadline: 'Chờ duyệt',
    status: 'reviewing',
    date: '25/08/2026',
    submittedAt: '08:45 25/08',
    myText: 'Lá cây thu nhận ánh sáng mặt trời qua chất diệp lục, kết hợp khí CO2 và nước để tạo ra đường glucose và giải phóng khí O2 giúp duy trì sự sống...',
    reflection: 'Chúng ta cần trồng thêm thật nhiều cây xanh quanh trường học và khu dân cư.'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'teacher',
    title: 'Bài review mới cần chấm',
    message: 'Học sinh Đức Huy (7A1) vừa nộp bài review môn Khoa học Tự nhiên.',
    timestamp: '15 phút trước',
    read: false,
    type: 'review_submitted',
    relatedReviewId: 'rev-4'
  },
  {
    id: 'notif-2',
    targetRole: 'parent',
    targetUserId: 'usr_parent_1',
    title: 'Con bạn vừa được cô giáo khen ngợi!',
    message: 'Minh Anh đạt điểm 9.5 bài review Văn học môn Ngữ Văn từ cô Hoàng Mai.',
    timestamp: 'Hôm qua',
    read: false,
    type: 'review_graded',
    relatedReviewId: 'rev-3'
  },
  {
    id: 'notif-3',
    targetRole: 'student',
    targetUserId: 'usr_student_1',
    title: 'Ba mẹ đã thả tim bài viết của bạn',
    message: 'Mẹ Lan đã gửi lời chúc: "Mẹ đọc bài văn con viết mà xúc động quá, cố gắng phát huy con nhé!"',
    timestamp: '2 ngày trước',
    read: true,
    type: 'parent_cheer',
    relatedReviewId: 'rev-3'
  },
  {
    id: 'notif-4',
    targetRole: 'student',
    targetUserId: 'usr_student_1',
    title: 'Yêu cầu sửa đổi bài viết',
    message: 'Cô giáo yêu cầu hoàn thiện thêm phần cảm nhận cá nhân môn Tiếng Anh.',
    timestamp: 'Hôm nay',
    read: false,
    type: 'revision_requested',
    relatedReviewId: 'rev-1'
  }
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    subject: 'Ngữ Văn',
    title: 'Đọc truyện "Bức tranh của em gái tôi"',
    pages: 'Trang 28 - 35',
    deadline: 'Ngày mai 17:00',
    rewardPoints: 30,
    completed: false,
    tag: 'Bắt buộc'
  },
  {
    id: 'task-2',
    subject: 'Khoa học',
    title: 'Tóm tắt quy trình nguyên phân và giảm phân',
    pages: 'Chương 4',
    deadline: '28/08/2026',
    rewardPoints: 25,
    completed: false,
    tag: 'Tự chọn'
  },
  {
    id: 'task-3',
    subject: 'Tiếng Anh',
    title: 'Unit 4: Music and Arts - Ghi nhớ 10 từ vựng',
    pages: 'Student Book p.40',
    deadline: '30/08/2026',
    rewardPoints: 20,
    completed: true,
    tag: 'Bắt buộc'
  }
];

const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    name: 'Ly kem mát lạnh 🍨',
    cost: 100,
    icon: '🍦',
    category: 'Ăn uống',
    description: 'Phiếu đổi 1 ly kem vani hoặc socola thơm ngon tại căng-tin trường.',
    redeemedCount: 3
  },
  {
    id: 'rew-2',
    name: 'Thẻ mượn sách ưu tiên 📖',
    cost: 150,
    icon: '📚',
    category: 'Học tập',
    description: 'Được mượn thêm 2 quyển truyện hoặc sách tham khảo đặc biệt tại thư viện trường.',
    redeemedCount: 1
  },
  {
    id: 'rew-3',
    name: 'Hộp bút dạ quang Pastel ✨',
    cost: 180,
    icon: '🖍️',
    category: 'Văn phòng phẩm',
    description: 'Bộ 6 cây highlight sắc màu pastel cao cấp dùng ghi chú bài học.',
    redeemedCount: 0
  }
];

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS[0]);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'reviews' | 'tasks' | 'rewards' | 'grading' | 'parent_feed'>('dashboard');
  const [points, setPoints] = useState<number>(245);
  const [streakDays, setStreakDays] = useState<number>(7);
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals and UI States
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

  // Custom User Creation/Login Form
  const [customLoginName, setCustomLoginName] = useState<string>('');
  const [customLoginRole, setCustomLoginRole] = useState<UserRole>('student');
  const [customLoginClass, setCustomLoginClass] = useState<string>('Lớp 7A1');

  // New review form
  const [newSubject, setNewSubject] = useState<string>('Ngữ Văn');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newChapter, setNewChapter] = useState<string>('');
  const [newText, setNewText] = useState<string>('');
  const [newReflection, setNewReflection] = useState<string>('');

  // Grading form (Teacher)
  const [gradeScore, setGradeScore] = useState<number>(9.0);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradeStatus, setGradeStatus] = useState<'completed' | 'needs_revision'>('completed');

  // Parent encouragement form
  const [parentCommentInput, setParentCommentInput] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Switch Role
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
    showToast(`✅ Xin chào ${newUser.name}! Bạn đang sử dụng vai trò ${newUser.role === 'student' ? 'Học sinh' : newUser.role === 'teacher' ? 'Giáo viên' : 'Phụ huynh'}.`);
  };

  // Create Review Handler (Triggers Student post + Teacher & Parent notifications)
  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const newRevId = `rev-${Date.now()}`;
    const newRev: ReviewItem = {
      id: newRevId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentClass: currentUser.class,
      studentAvatar: currentUser.avatar,
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

    // 1. Add review to list
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

    showToast(`🎉 Đã nộp bài review thành công! +${earnedPoints} điểm thưởng. Hệ thống đã tự động gửi thông báo đến Giáo viên và Ba mẹ.`);
  };

  // Update/Revise Review Handler
  const handleUpdateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    setReviews(prev =>
      prev.map(r =>
        r.id === editingReview.id
          ? {
              ...editingReview,
              status: 'reviewing',
              feedback: 'Học sinh đã nộp lại bài chỉnh sửa. Đang chờ giáo viên đánh giá lại.',
              urgent: false
            }
          : r
      )
    );

    // Notify teacher that revision was submitted
    const reviseNotif: AppNotification = {
      id: `notif-${Date.now()}-revised`,
      targetRole: 'teacher',
      title: `Bài sửa lại từ ${currentUser.name}`,
      message: `Học sinh đã chỉnh sửa bài review môn ${editingReview.subject}: "${editingReview.title}".`,
      timestamp: 'Vừa xong',
      read: false,
      type: 'review_submitted',
      relatedReviewId: editingReview.id
    };
    setNotifications([reviseNotif, ...notifications]);

    const bonus = 15;
    setPoints(p => p + bonus);
    setEditingReview(null);
    showToast(`✨ Đã nộp lại bài sửa thành công! +${bonus} điểm tích cực. Giáo viên đã nhận được thông báo bài sửa.`);
  };

  // Teacher Grades Review Handler
  const handleTeacherGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingReview) return;

    const isPassed = gradeStatus === 'completed';

    setReviews(prev =>
      prev.map(r =>
        r.id === gradingReview.id
          ? {
              ...r,
              status: gradeStatus,
              score: isPassed ? Number(gradeScore) : undefined,
              feedback: gradeFeedback.trim() || (isPassed ? 'Bài viết đạt yêu cầu, tư duy tốt!' : 'Em hãy đọc lại nhận xét và bổ sung chi tiết nhé.'),
              teacherName: currentUser.name,
              urgent: !isPassed
            }
          : r
      )
    );

    // Notification to Student
    const studentNotif: AppNotification = {
      id: `notif-grade-stud-${Date.now()}`,
      targetRole: 'student',
      targetUserId: gradingReview.studentId,
      title: isPassed ? `Chúc mừng! Cô giáo đã chấm ${gradeScore} điểm` : `Yêu cầu chỉnh sửa bài viết`,
      message: `${currentUser.name} đã nhận xét bài "${gradingReview.title}": "${gradeFeedback || (isPassed ? 'Đạt chuẩn' : 'Cần sửa đổi')}"`,
      timestamp: 'Vừa xong',
      read: false,
      type: isPassed ? 'review_graded' : 'revision_requested',
      relatedReviewId: gradingReview.id
    };

    // Notification to Parent
    const parentNotif: AppNotification = {
      id: `notif-grade-par-${Date.now()}`,
      targetRole: 'parent',
      title: isPassed ? `Kết quả bài học của con: ${gradeScore}/10 ⭐` : `Thông báo sửa bài học của con`,
      message: `Giáo viên ${currentUser.name} vừa đánh giá bài "${gradingReview.title}" của ${gradingReview.studentName}.`,
      timestamp: 'Vừa xong',
      read: false,
      type: isPassed ? 'review_graded' : 'revision_requested',
      relatedReviewId: gradingReview.id
    };

    setNotifications([studentNotif, parentNotif, ...notifications]);
    setGradingReview(null);
    setGradeFeedback('');
    showToast(`✅ Đã gửi điểm & lời nhận xét thành công! Học sinh và Phụ huynh đã nhận được thông báo.`);
  };

  // Parent Cheer / Reaction Handler
  const handleParentCheer = (reviewId: string, reactionText: string) => {
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? {
              ...r,
              parentReaction: reactionText,
              parentComment: parentCommentInput.trim() || r.parentComment
            }
          : r
      )
    );

    const cheeredReview = reviews.find(r => r.id === reviewId);
    if (cheeredReview) {
      const cheerNotif: AppNotification = {
        id: `notif-cheer-${Date.now()}`,
        targetRole: 'student',
        targetUserId: cheeredReview.studentId,
        title: `Ba mẹ đã gửi lời động viên! ${reactionText}`,
        message: parentCommentInput.trim()
          ? `Phụ huynh nhắn: "${parentCommentInput.trim()}"`
          : `Ba mẹ rất tự hào về bài viết "${cheeredReview.title}" của bạn!`,
        timestamp: 'Vừa xong',
        read: false,
        type: 'parent_cheer',
        relatedReviewId: reviewId
      };
      setNotifications([cheerNotif, ...notifications]);
    }

    setParentCommentInput('');
    showToast(`❤️ Đã gửi lời động viên và thả tim thành công đến con yêu!`);
  };

  // Filter reviews based on role and filters
  const userFilteredReviews = reviews.filter(r => {
    // If student, can see all or own, let's allow seeing own prominently
    if (currentUser.role === 'student' && currentTab === 'dashboard') {
      return r.studentId === currentUser.id;
    }
    return true;
  });

  const searchedReviews = reviews.filter(r => {
    const match =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 max-w-md"
        >
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm font-semibold leading-snug">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-auto p-1 rounded-lg hover:bg-slate-800"
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
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            id="mobile-menu-button"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg tracking-wider shadow-sm shadow-blue-300">
            LR
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-blue-900 tracking-tight leading-none flex items-center gap-2">
              <span>LEARN & REVIEW</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
              Think • Write • Grow • Connect
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Guide & Share Helper */}
          <button
            id="btn-login-guide"
            onClick={() => setShowLoginGuide(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-xs font-bold transition border border-blue-200 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Cách đăng nhập & Báo Phụ huynh/GV</span>
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
                <span className="text-amber-500 font-bold text-base leading-none">⭐</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">{points} Pts</span>
              </button>
              <div className="w-[1px] h-3.5 bg-slate-300"></div>
              <div className="flex items-center gap-1.5" id="header-streak-badge">
                <span className="text-orange-500 font-bold text-base leading-none">🔥</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">{streakDays} Ngày</span>
              </div>
            </div>
          )}

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              id="btn-notifications-bell"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Thông báo tương tác"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifDropdown && (
              <div
                id="notif-dropdown"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">Hộp thông báo kết nối</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {currentUser.role === 'teacher' ? 'Dành cho Giáo viên' : currentUser.role === 'parent' ? 'Dành cho Phụ huynh' : 'Dành cho Học sinh'}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.filter(n => n.targetRole === currentUser.role || n.targetRole === 'all').length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Không có thông báo mới nào.
                    </div>
                  ) : (
                    notifications
                      .filter(n => n.targetRole === currentUser.role || n.targetRole === 'all')
                      .map(notif => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-slate-50 transition flex items-start gap-3 cursor-pointer ${
                            !notif.read ? 'bg-blue-50/40' : ''
                          }`}
                          onClick={() => {
                            setNotifications(prev =>
                              prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
                            );
                            if (currentUser.role === 'teacher') setCurrentTab('grading');
                            if (currentUser.role === 'parent') setCurrentTab('parent_feed');
                            if (currentUser.role === 'student') setCurrentTab('reviews');
                            setShowNotifDropdown(false);
                          }}
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-sm">
                            {notif.type === 'review_submitted' ? '📝' : notif.type === 'review_graded' ? '⭐' : notif.type === 'parent_cheer' ? '❤️' : '🔔'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 leading-snug">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                              {notif.timestamp}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      showToast('✅ Đã đánh dấu đọc tất cả thông báo!');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Đánh dấu đã đọc tất cả
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Switcher Pill */}
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full border border-slate-200 transition cursor-pointer"
              title="Nhấn để đổi vai trò (Học sinh / Giáo viên / Phụ huynh) hoặc đăng nhập tài khoản khác"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-2xs ${
                  currentUser.role === 'teacher'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    : currentUser.role === 'parent'
                    ? 'bg-gradient-to-br from-rose-500 to-amber-600'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}
              >
                {currentUser.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-blue-600 font-semibold leading-tight">
                  {currentUser.role === 'teacher' ? '👩‍🏫 Giáo viên' : currentUser.role === 'parent' ? '👨‍👩‍👧 Phụ huynh' : `🎓 ${currentUser.class}`}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Role & User Switcher Modal/Menu */}
            {showRoleSwitcher && (
              <div
                id="role-switcher-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Chuyển đổi vai trò & Tài khoản</h4>
                    <p className="text-[11px] text-slate-400">Chọn vai trò mẫu hoặc đăng nhập với tên của bạn</p>
                  </div>
                  <button onClick={() => setShowRoleSwitcher(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Role selection quick list */}
                <div className="flex flex-col gap-2 mb-4">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Tài khoản mẫu thử nghiệm:
                  </span>
                  {PRESET_USERS.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition text-left cursor-pointer ${
                        currentUser.id === u.id
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                            u.role === 'teacher'
                              ? 'bg-purple-600'
                              : u.role === 'parent'
                              ? 'bg-rose-600'
                              : 'bg-blue-600'
                          }`}
                        >
                          {u.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {u.role === 'teacher' ? '👩‍🏫 Giáo viên chấm bài' : u.role === 'parent' ? '👨‍👩‍👧 Phụ huynh theo dõi' : `🎓 Học sinh (${u.class})`}
                          </p>
                        </div>
                      </div>
                      {currentUser.id === u.id && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom User Login */}
                <form onSubmit={handleCustomLogin} className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Hoặc đăng nhập với tên của bạn:
                  </span>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên của bạn..."
                    value={customLoginName}
                    onChange={e => setCustomLoginName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium"
                    required
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomLoginRole('student')}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border ${
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
                      className={`py-1.5 rounded-lg text-[11px] font-bold border ${
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
                      className={`py-1.5 rounded-lg text-[11px] font-bold border ${
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  )}
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl mt-1 transition cursor-pointer"
                  >
                    Bắt đầu làm việc với tên này
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
            fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-5 flex flex-col gap-2 transition-transform duration-200 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Danh mục điều hướng</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-2 bg-slate-100 rounded-2xl mb-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Không gian làm việc</p>
              <p className="text-xs font-bold text-slate-800">
                {currentUser.role === 'teacher' ? '👩‍🏫 Bàn làm việc Giáo viên' : currentUser.role === 'parent' ? '👨‍👩‍👧 Sổ liên lạc Phụ huynh' : '🎓 Học tập & Tích điểm'}
              </p>
            </div>
            <button
              onClick={() => setShowRoleSwitcher(true)}
              className="text-[10px] font-bold text-blue-600 hover:underline"
              title="Đổi vai trò"
            >
              Đổi
            </button>
          </div>

          <nav className="flex flex-col gap-1.5" id="nav-container">
            {/* Student standard tabs */}
            <button
              id="nav-dashboard"
              onClick={() => {
                setCurrentTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">🏠</span>
              <span>Tổng quan chung</span>
            </button>

            <button
              id="nav-reviews"
              onClick={() => {
                setCurrentTab('reviews');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'reviews'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📚</span>
                <span>Bài Review bài học</span>
              </div>
              {needsAttentionCount > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {needsAttentionCount}
                </span>
              )}
            </button>

            {/* Teacher Specific Tab */}
            <button
              id="nav-teacher-grading"
              onClick={() => {
                setCurrentTab('grading');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'grading'
                  ? 'bg-purple-50 text-purple-700 shadow-xs border border-purple-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">👩‍🏫</span>
                <span>Góc Giáo Viên Chấm Bài</span>
              </div>
              {pendingGradingCount > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingGradingCount}
                </span>
              )}
            </button>

            {/* Parent Specific Tab */}
            <button
              id="nav-parent-feed"
              onClick={() => {
                setCurrentTab('parent_feed');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'parent_feed'
                  ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">👨‍👩‍👧</span>
              <span>Sổ Liên Lạc Ba Mẹ</span>
            </button>

            <button
              id="nav-tasks"
              onClick={() => {
                setCurrentTab('tasks');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'tasks'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📋</span>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 text-left cursor-pointer ${
                currentTab === 'rewards'
                  ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">🎁</span>
              <span>Đổi phần thưởng</span>
            </button>
          </nav>

          {/* Slogan Quote Card */}
          <div className="mt-auto p-4 bg-indigo-900 rounded-2xl text-white relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-widest">
                  Triết lý giáo dục
                </p>
              </div>
              <p className="text-xs italic leading-relaxed text-indigo-100 font-medium">
                &ldquo;Đừng chỉ đọc. Hãy nhớ. Hãy suy nghĩ. Hãy kể lại bằng chính lời của mình.&rdquo;
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-600/30 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 md:hidden"
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {currentUser.role === 'student' ? 'Học sinh đang hoạt động' : currentUser.role === 'teacher' ? 'Bảng điều khiển Giáo viên' : 'Giao diện Phụ huynh'}
                    </span>
                    <span className="text-xs text-slate-400">• {currentUser.class}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Xin chào, {currentUser.name}! 👋
                  </h2>
                  <p className="text-slate-500 mt-1 text-sm sm:text-base">
                    {currentUser.role === 'student'
                      ? 'Khi bạn viết bài review, bài sẽ tự động hiển thị với tên bạn và gửi thông báo tới Giáo viên & Ba mẹ.'
                      : currentUser.role === 'teacher'
                      ? 'Bạn có thể xem bài của tất cả học sinh, chấm điểm và gửi lời nhận xét trực tiếp.'
                      : 'Theo dõi tiến trình bài đọc, điểm thưởng và nhận xét của giáo viên dành cho con.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowLoginGuide(true)}
                    className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-bold border border-slate-200 shadow-xs flex items-center gap-2 transition cursor-pointer text-sm"
                  >
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Hướng dẫn gửi App</span>
                  </button>

                  <button
                    id="btn-create-review"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-5 sm:px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
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
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                      <span>Mục tiêu tuần</span>
                      <span className="text-amber-600 font-bold">65%</span>
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
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                      <span>Tỷ lệ hoàn thành</span>
                      <span className="text-emerald-600 font-bold">85%</span>
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
                    <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                      <Check className="w-3.5 h-3.5" /> Báo GV
                    </span>
                    <span className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-md">
                      <Check className="w-3.5 h-3.5" /> Báo Ba Mẹ
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Split: Recent Reviews & Live Tri-Party Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 cols): Reviews Stream */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Bài Review bài học mới nhất</h3>
                      <p className="text-xs text-slate-400">Hiển thị tác giả, tên học sinh và phản hồi</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('reviews')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      Xem tất cả ({reviews.length}) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[420px]">
                    {reviews.slice(0, 3).map(rev => (
                      <div
                        key={rev.id}
                        className={`p-4 rounded-2xl border transition flex flex-col gap-3 ${
                          rev.status === 'needs_revision'
                            ? 'bg-orange-50/60 border-orange-200'
                            : rev.status === 'completed'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-blue-50/40 border-blue-200'
                        }`}
                      >
                        {/* Student Author Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                              {rev.studentAvatar}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                {rev.studentName}
                                <span className="ml-2 font-normal text-slate-500 text-[11px]">({rev.studentClass})</span>
                              </p>
                              <p className="text-[10px] text-slate-400">Nộp lúc {rev.submittedAt}</p>
                            </div>
                          </div>

                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                              {rev.subject}
                            </span>
                            <span className="text-xs text-slate-400">• {rev.chapter}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic bg-white/70 p-2.5 rounded-xl border border-slate-200/50">
                            &ldquo;{rev.myText}&rdquo;
                          </p>
                        </div>

                        {/* Teacher Feedback pill */}
                        {rev.feedback && (
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2">
                            <span className="text-xs">👩‍🏫</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-800">
                                {rev.teacherName || 'Giáo viên bộ môn'}:
                              </p>
                              <p className="text-xs text-slate-600 italic leading-snug">{rev.feedback}</p>
                            </div>
                          </div>
                        )}

                        {/* Parent Reaction pill if available */}
                        {rev.parentReaction && (
                          <div className="p-2 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span>👨‍👩‍👧</span>
                              <span className="font-semibold text-rose-900">{rev.parentReaction}</span>
                              {rev.parentComment && <span className="text-slate-500 italic">"{rev.parentComment}"</span>}
                            </div>
                            <span className="text-[10px] text-rose-600 font-bold">Phụ huynh đã xem</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          {currentUser.role === 'student' && rev.status === 'needs_revision' && (
                            <button
                              onClick={() => setEditingReview(rev)}
                              className="bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-orange-700 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Sửa bài nộp lại
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
                              className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Chấm & Nhận xét
                            </button>
                          )}

                          {currentUser.role === 'parent' && (
                            <button
                              onClick={() => handleParentCheer(rev.id, '❤️ Rất tự hào về con!')}
                              className="bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-rose-700 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Heart className="w-3.5 h-3.5" /> Thả tim động viên
                            </button>
                          )}

                          <button
                            onClick={() => setCurrentTab('reviews')}
                            className="text-xs font-semibold text-blue-600 hover:underline ml-auto"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right (1 col): How Notification Works & Streak Widget */}
                <div className="flex flex-col gap-6">
                  {/* Streak & Checkin */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">Chuỗi ngày học liên tục</h3>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                        🔥 7 Ngày liên tiếp
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'].map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div
                            className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold ${
                              i <= 5 ? 'bg-emerald-500 text-white' : 'bg-slate-100 border border-slate-200 text-slate-400'
                            }`}
                          >
                            {i <= 5 ? '✓' : '?'}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">{day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tri-Party Notification Status Card */}
                  <div className="bg-linear-to-br from-indigo-900 to-blue-950 rounded-3xl p-6 text-white shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                        Quy trình tự động
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>
                    <h4 className="font-bold text-base text-white leading-snug">
                      Hệ thống tự động thông báo khi có Review mới
                    </h4>
                    <ul className="text-xs text-indigo-100 space-y-2.5">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">1.</span>
                        <span>
                          <strong>Học sinh nộp bài</strong>: Tên, lớp và nội dung lập tức hiển thị công khai.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">2.</span>
                        <span>
                          <strong>Báo Giáo viên</strong>: Hiện ngay trong danh sách chấm điểm để cô vào nhận xét.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">3.</span>
                        <span>
                          <strong>Báo Ba Mẹ</strong>: Phụ huynh nhận tin báo qua sổ liên lạc điện tử kèm điểm số.
                        </span>
                      </li>
                    </ul>

                    <button
                      onClick={() => setShowLoginGuide(true)}
                      className="mt-1 bg-white text-indigo-950 font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-indigo-50 transition text-center cursor-pointer"
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
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Tất cả bài Review ({searchedReviews.length} bài)
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Kho bài viết cảm nhận bài đọc sách, môn học của học sinh kèm phản hồi từ giáo viên.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Plus className="w-4 h-4" /> Viết Review mới
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên học sinh, môn học, bài..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Lọc:</span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'needs_revision', label: 'Cần sửa' },
                    { id: 'reviewing', label: 'Chờ duyệt' },
                    { id: 'completed', label: 'Đã đạt' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setReviewFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchedReviews.map(r => (
                  <div
                    key={r.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Author & status badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            {r.studentAvatar}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">{r.studentName}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">({r.studentClass})</span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md ${
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

                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                          {r.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{r.chapter}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">{r.title}</h3>

                      <div className="mt-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-700 font-normal leading-relaxed">
                          &ldquo;{r.myText}&rdquo;
                        </p>
                        {r.reflection && (
                          <p className="text-[11px] text-indigo-700 mt-2 font-medium">
                            💡 <strong>Cảm nhận cá nhân:</strong> {r.reflection}
                          </p>
                        )}
                      </div>

                      {/* Teacher Feedback */}
                      <div className="mt-3 p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-2">
                        <span className="text-xs">👩‍🏫</span>
                        <div>
                          <p className="text-[11px] font-bold text-blue-950">
                            {r.teacherName || 'Giáo viên hướng dẫn'}:
                          </p>
                          <p className="text-xs text-slate-700 italic">&ldquo;{r.feedback}&rdquo;</p>
                        </div>
                      </div>

                      {/* Parent encouragement if any */}
                      {r.parentReaction && (
                        <div className="mt-2 p-2.5 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between text-xs">
                          <span className="font-semibold text-rose-900">👨‍👩‍👧 {r.parentReaction}</span>
                          <span className="text-[10px] text-rose-500 font-bold">Phụ huynh đồng hành</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom controls */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Đã nộp: {r.submittedAt}</span>

                      <div className="flex items-center gap-2">
                        {currentUser.role === 'teacher' && (
                          <button
                            onClick={() => {
                              setGradingReview(r);
                              setGradeScore(r.score || 9.0);
                              setGradeFeedback(r.feedback || '');
                              setGradeStatus(r.status === 'needs_revision' ? 'needs_revision' : 'completed');
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                          >
                            Chấm điểm
                          </button>
                        )}

                        {currentUser.role === 'parent' && (
                          <button
                            onClick={() => handleParentCheer(r.id, '❤️ Ba mẹ rất khen ngợi!')}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                          >
                            Động viên
                          </button>
                        )}

                        {currentUser.role === 'student' && r.status === 'needs_revision' && (
                          <button
                            onClick={() => setEditingReview(r)}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
                          >
                            Chỉnh sửa bài
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TEACHER GRADING PORTAL (GÓC GIÁO VIÊN) */}
          {currentTab === 'grading' && (
            <div className="flex flex-col gap-6" id="view-teacher-grading">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-900 text-white p-6 rounded-3xl shadow-md">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-purple-800 text-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Khu vực Chuyên môn
                    </span>
                    <span className="text-xs text-purple-300">GV: {currentUser.name}</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Hòm thư duyệt & Chấm điểm Review</h2>
                  <p className="text-purple-200 text-xs sm:text-sm mt-1">
                    Mỗi khi học sinh nộp bài mới hoặc chỉnh sửa, bài sẽ hiển thị ngay tại đây để cô chấm và nhận xét.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-800/80 px-4 py-2.5 rounded-2xl text-center border border-purple-700">
                    <p className="text-xs text-purple-300">Chờ duyệt</p>
                    <p className="text-xl font-black text-amber-300">{pendingGradingCount} bài</p>
                  </div>
                  <div className="bg-purple-800/80 px-4 py-2.5 rounded-2xl text-center border border-purple-700">
                    <p className="text-xs text-purple-300">Cần sửa</p>
                    <p className="text-xl font-black text-rose-300">{needsAttentionCount} bài</p>
                  </div>
                </div>
              </div>

              {/* Filter Tabs for Teacher */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase mr-2">Danh sách lớp:</span>
                <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold">
                  Tất cả lớp (7A1, 7A2)
                </button>
                <button className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold">
                  Chỉ bài chờ chấm ({pendingGradingCount})
                </button>
              </div>

              {/* Reviews needing teacher action */}
              <div className="grid grid-cols-1 gap-4">
                {reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-purple-300 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {rev.studentAvatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {rev.studentName} <span className="text-xs font-normal text-slate-500">• {rev.studentClass}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">Nộp lúc {rev.submittedAt}</p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md ml-auto md:ml-0 ${
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

                      <h4 className="text-base font-bold text-slate-900 mt-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mr-2">
                          {rev.subject}
                        </span>
                        {rev.title}
                      </h4>

                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        &ldquo;{rev.myText}&rdquo;
                      </p>

                      {rev.feedback && (
                        <p className="text-xs text-purple-900 mt-2 font-medium bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                          💬 <strong>Nhận xét hiện tại của cô:</strong> {rev.feedback}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 justify-center">
                      <button
                        onClick={() => {
                          setGradingReview(rev);
                          setGradeScore(rev.score || 9.0);
                          setGradeFeedback(rev.feedback || '');
                          setGradeStatus(rev.status === 'needs_revision' ? 'needs_revision' : 'completed');
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>CHẤM ĐIỂM / NHẬN XÉT</span>
                      </button>

                      <button
                        onClick={() => {
                          showToast(`📧 Đã gửi email nhắc nhở bổ sung đến học sinh ${rev.studentName}!`);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Nhắc nhở học sinh</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PARENT FEED (SỔ LIÊN LẠC ĐIỆN TỬ BA MẸ) */}
          {currentTab === 'parent_feed' && (
            <div className="flex flex-col gap-6" id="view-parent-feed">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-6 rounded-3xl shadow-md">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-rose-700/80 text-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Sổ Liên Lạc Điện Tử
                    </span>
                    <span className="text-xs text-rose-200">Đang theo dõi: Em Minh Anh (Lớp 7A1)</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Nhật Ký Học Tập Của Con</h2>
                  <p className="text-rose-100 text-xs sm:text-sm mt-1">
                    Ba mẹ nhận thông báo thời gian thực mỗi khi con viết bài review, xem điểm và nhận xét từ thầy cô.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-black/20 backdrop-blur-xs px-4 py-2.5 rounded-2xl text-center border border-white/10">
                    <p className="text-xs text-rose-200">Điểm thưởng của con</p>
                    <p className="text-xl font-black text-amber-300">{points} ⭐</p>
                  </div>
                  <div className="bg-black/20 backdrop-blur-xs px-4 py-2.5 rounded-2xl text-center border border-white/10">
                    <p className="text-xs text-rose-200">Chuỗi chuyên cần</p>
                    <p className="text-xl font-black text-emerald-300">{streakDays} ngày 🔥</p>
                  </div>
                </div>
              </div>

              {/* Real-time parent notification settings */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold text-lg">
                    📱
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Kênh thông báo tức thì đến Phụ huynh</p>
                    <p className="text-[11px] text-slate-500">
                      Tự động gửi thông báo qua App & Tin nhắn SMS/Zalo khi con hoàn thành bài học
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" /> Đang kích hoạt kết nối
                  </span>
                </div>
              </div>

              {/* Child's Learning Timeline */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-slate-900 text-base">Dòng hoạt động đọc sách & review của con</h3>
                {reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4 hover:border-rose-200 transition"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-lg font-bold text-rose-700">
                          📖
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {rev.subject}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Thời gian nộp: {rev.submittedAt}</p>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-md ${
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
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-700 mb-1">✍️ Bài viết của con:</p>
                      <p className="text-xs text-slate-800 italic leading-relaxed">&ldquo;{rev.myText}&rdquo;</p>
                      {rev.reflection && (
                        <p className="text-xs text-indigo-800 mt-2 font-medium">
                          💡 <strong>Bài học con rút ra:</strong> {rev.reflection}
                        </p>
                      )}
                    </div>

                    {/* Teacher feedback to parent */}
                    {rev.feedback && (
                      <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-start gap-2.5">
                        <span className="text-base">👩‍🏫</span>
                        <div>
                          <p className="text-xs font-bold text-purple-950">
                            Nhận xét từ giáo viên ({rev.teacherName || 'Cô giáo'}):
                          </p>
                          <p className="text-xs text-purple-800 mt-0.5">&ldquo;{rev.feedback}&rdquo;</p>
                        </div>
                      </div>
                    )}

                    {/* Parent interactive cheering bar */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-slate-500">Động viên con:</span>
                        <button
                          onClick={() => handleParentCheer(rev.id, '❤️ Tự hào về con lắm!')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
                        >
                          ❤️ Tự hào về con
                        </button>
                        <button
                          onClick={() => handleParentCheer(rev.id, '🌟 Con viết rất sâu sắc!')}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition cursor-pointer"
                        >
                          🌟 Khen sáng tạo
                        </button>
                        <button
                          onClick={() => handleParentCheer(rev.id, '🍦 Tối nay mẹ thưởng kem nhé!')}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition cursor-pointer"
                        >
                          🍦 Thưởng quà
                        </button>
                      </div>

                      {rev.parentReaction && (
                        <div className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full">
                          Đã gửi: {rev.parentReaction}
                        </div>
                      )}
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
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Nhiệm vụ bài học mới</h2>
                <p className="text-slate-500 text-sm">
                  Đọc tài liệu và viết review để tích lũy điểm thưởng đổi quà!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`bg-white rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition ${
                      task.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                          {task.subject}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-rose-100 text-rose-700">
                          {task.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">📖 {task.pages}</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        ⏰ Hạn chót nộp: <strong>{task.deadline}</strong>
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
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
                        className={`text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 p-6 rounded-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-amber-950 tracking-tight">
                    Cửa Hàng Phần Thưởng Học Tập 🎁
                  </h2>
                  <p className="text-amber-800 text-sm mt-1">
                    Đổi điểm tích lũy từ các bài review chất lượng để nhận quà tặng hấp dẫn!
                  </p>
                </div>
                <div className="bg-white px-5 py-3 rounded-2xl border border-amber-200 text-center shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">Điểm hiện có của bạn</p>
                  <p className="text-2xl font-black text-amber-600">⭐ {points} Pts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {rewards.map(rew => (
                  <div
                    key={rew.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-amber-100 shadow-2xs">
                        {rew.icon}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{rew.name}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{rew.description}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Cần tích lũy</p>
                        <p className="text-sm font-black text-slate-900">{rew.cost} Điểm</p>
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
                        className={`text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
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

      {/* MODAL 1: CREATE NEW REVIEW */}
      {isCreateModalOpen && (
        <div
          id="modal-create-review"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Viết Bài Review Mới</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tác giả: <strong>{currentUser.name}</strong> ({currentUser.class})
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chương / Bài</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Chương 3, Bài 5..."
                    value={newChapter}
                    onChange={e => setNewChapter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài học hoặc sách</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cảm nhận về nhân vật dế mèn..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung tóm tắt & Lời văn của em (Review chính)
                </label>
                <textarea
                  rows={4}
                  placeholder="Hãy kể lại những ý chính quan trọng bằng ngôn ngữ của chính em, không sao chép nguyên văn..."
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cảm nghĩ hoặc bài học tâm đắc nhất của em
                </label>
                <textarea
                  rows={2}
                  placeholder="Em rút ra được điều gì áp dụng vào cuộc sống hay học tập?"
                  value={newReflection}
                  onChange={e => setNewReflection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
                <span className="text-sm">🔔</span>
                <p>
                  Khi bấm <strong>"Nộp bài & Tích điểm"</strong>, bài viết sẽ được gửi đồng thời tới <strong>Giáo viên bộ môn</strong> để chấm điểm và cập nhật lên <strong>Sổ liên lạc của Ba Mẹ</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  Nộp bài & Tích 25 điểm ⭐
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
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase">Chỉnh sửa & Hoàn thiện bài</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{editingReview.title}</h3>
              </div>
              <button
                onClick={() => setEditingReview(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-2xl">
              <p className="text-xs font-bold text-orange-950">👩‍🏫 Nhận xét của giáo viên cần khắc phục:</p>
              <p className="text-xs text-orange-800 mt-1 italic">&ldquo;{editingReview.feedback}&rdquo;</p>
            </div>

            <form onSubmit={handleUpdateReview} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung bài viết bổ sung</label>
                <textarea
                  rows={5}
                  value={editingReview.myText}
                  onChange={e => setEditingReview({ ...editingReview, myText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs focus:outline-none focus:border-blue-500 leading-relaxed font-normal"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phần cảm nhận cá nhân bổ sung</label>
                <textarea
                  rows={2}
                  value={editingReview.reflection || ''}
                  onChange={e => setEditingReview({ ...editingReview, reflection: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer"
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
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">Góc Giáo Viên Chấm Bài</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{gradingReview.title}</h3>
                <p className="text-xs text-slate-500">
                  Học sinh: <strong>{gradingReview.studentName}</strong> ({gradingReview.studentClass})
                </p>
              </div>
              <button
                onClick={() => setGradingReview(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student's text */}
            <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-700 mb-1">📖 Bài làm của học sinh:</p>
              <p className="text-xs text-slate-800 leading-relaxed italic">&ldquo;{gradingReview.myText}&rdquo;</p>
              {gradingReview.reflection && (
                <p className="text-xs text-indigo-800 mt-2">
                  💡 <strong>Cảm nhận:</strong> {gradingReview.reflection}
                </p>
              )}
            </div>

            <form onSubmit={handleTeacherGrade} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kết quả đánh giá</label>
                  <select
                    value={gradeStatus}
                    onChange={e => setGradeStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none font-bold"
                  >
                    <option value="completed">⭐ Đạt chuẩn (Cho điểm)</option>
                    <option value="needs_revision">⚠️ Yêu cầu học sinh viết lại</option>
                  </select>
                </div>

                {gradeStatus === 'completed' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Điểm số (Thang điểm 10)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={gradeScore}
                      onChange={e => setGradeScore(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-bold"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời nhận xét & Hướng dẫn của cô giáo
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi nhận xét chi tiết để học sinh và ba mẹ cùng nắm bắt..."
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingReview(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  Gửi Điểm & Báo Học sinh / Phụ huynh 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LOGIN & SHARING GUIDE (HƯỚNG DẪN KHI GỬI CHO NGƯỜI DÙNG) */}
      {showLoginGuide && (
        <div
          id="modal-login-guide"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                  🚀
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Hướng Dẫn Đăng Nhập & Kết Nối 3 Bên</h3>
                  <p className="text-xs text-slate-400">Cách hoạt động khi chia sẻ ứng dụng cho Học sinh, Giáo viên & Ba mẹ</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginGuide(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
              {/* Step 1 */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-blue-950 text-sm">Học sinh đăng nhập và hiển thị bài viết như thế nào?</h4>
                  <p className="mt-1 text-slate-600 text-xs leading-relaxed">
                    - Khi mở link ứng dụng, người dùng có thể bấm vào góc trên bên phải để <strong>chọn tài khoản học sinh mẫu (Minh Anh, Đức Huy...)</strong> hoặc <strong>nhập trực tiếp Họ Tên và Lớp</strong> của mình.<br />
                    - Khi học sinh bấm <strong>"TẠO REVIEW MỚI"</strong> và nộp bài, hệ thống sẽ tự động gắn <strong>Tên tác giả, Ảnh đại diện, Lớp học và Giờ nộp</strong> vào bài viết.<br />
                    - Bài viết sẽ hiển thị ngay lập tức trên Bảng tin chung và danh mục <em>"Review của tôi"</em>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-purple-950 text-sm">Giáo viên nhận thông báo và chấm bài như thế nào?</h4>
                  <p className="mt-1 text-slate-600 text-xs leading-relaxed">
                    - Giáo viên khi đăng nhập vào mục <strong>"Góc Giáo Viên Chấm Bài"</strong> sẽ thấy ngay danh sách các bài review mới nộp cần duyệt.<br />
                    - Đồng thời <strong>Chuông thông báo 🔔</strong> trên thanh tiêu đề sẽ báo động đỏ: <em>"Học sinh [Tên] vừa nộp bài review môn [Môn học]"</em>.<br />
                    - Giáo viên bấm vào để cho điểm (1 - 10), viết lời phê hoặc yêu cầu sửa lại kèm hướng dẫn.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 text-sm">Ba mẹ (Phụ huynh) theo dõi và nhận thông báo ra sao?</h4>
                  <p className="mt-1 text-slate-600 text-xs leading-relaxed">
                    - Phụ huynh khi vào mục <strong>"Sổ Liên Lạc Ba Mẹ"</strong> sẽ xem được toàn bộ dòng thời gian con đọc sách gì, viết gì, được cô chấm mấy điểm.<br />
                    - Hệ thống đẩy thông báo: <em>"Con của bạn vừa hoàn thành bài học và được cô giáo khen ngợi!"</em>.<br />
                    - Ba mẹ có thể trực tiếp <strong>"Thả tim ❤️"</strong>, <strong>"Khen ngợi 🌟"</strong> hoặc gửi <strong>"Phần thưởng kem 🍦"</strong> để động viên tinh thần con.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowLoginGuide(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Đã hiểu, đóng hướng dẫn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
