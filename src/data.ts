import { UserProfile, ReviewItem, TaskItem, RewardItem, AppNotification } from './types';

export const PRESET_USERS: UserProfile[] = [
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

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    studentId: 'usr_student_1',
    studentName: 'Minh Anh',
    studentClass: 'Lớp 7A1',
    studentAvatar: 'MA',
    subject: 'Tiếng Anh',
    title: 'Chapter 3: Global Citizens & Climate Action',
    chapter: 'Bài đọc Unit 3 (Trang 45 - 52)',
    feedback: 'Em cần bổ sung thêm phần cảm nhận cá nhân về trách nhiệm của mỗi công dân trẻ đối với môi trường nhé.',
    deadline: 'Hôm nay',
    status: 'needs_revision',
    urgent: true,
    date: '24/08/2026',
    submittedAt: '14:30 24/08',
    myText: `Trong chương 3 "Global Citizens", tác giả đã đưa người đọc qua một hành trình vòng quanh thế giới để tìm hiểu sự đa dạng văn hóa và cách thế hệ trẻ tại các quốc gia khác nhau cùng chung tay giải quyết những thách thức toàn cầu.

Điểm nổi bật nhất của bài học là câu chuyện về các sáng kiến giảm rác thải nhựa tại các trường học ven biển. Học sinh không chỉ học lý thuyết mà còn thành lập các nhóm tình nguyện phân loại rác, trồng cây chắn sóng và tuyên truyền cho cư dân địa phương. Tác giả nhấn mạnh rằng: "Trở thành công dân toàn cầu không phải là đi du lịch khắp nơi, mà là có tư duy rộng mở và hành động vì cộng đồng từ những việc nhỏ nhất".

Bài viết sử dụng nhiều cấu trúc ngữ pháp phong phú về thì hiện tại hoàn thành và các mệnh đề quan hệ để diễn đạt ý tưởng chặt chẽ.`,
    reflection: 'Em nhận ra rằng bảo vệ môi trường không phải là nhiệm vụ của riêng ai, bản thân em cũng có thể bắt đầu từ việc hạn chế dùng đồ nhựa một lần tại trường học.',
    teacherName: 'Thầy David Wilson'
  },
  {
    id: 'rev-2',
    studentId: 'usr_student_1',
    studentName: 'Minh Anh',
    studentClass: 'Lớp 7A1',
    studentAvatar: 'MA',
    subject: 'Toán học',
    title: 'Bài 5: Đại lượng tỷ lệ nghịch và ứng dụng giải toán thực tế',
    chapter: 'Chương 2: Đại số 7 (Trang 58 - 64)',
    feedback: 'Giải thích bản chất công thức y = a/x còn hơi ngắn, hãy đưa thêm ví dụ thực tế về thời gian và vận tốc.',
    deadline: '2 ngày tới',
    status: 'needs_revision',
    urgent: false,
    date: '23/08/2026',
    submittedAt: '09:15 23/08',
    myText: `Đại lượng tỷ lệ nghịch là một trong những khái niệm quan trọng nhất của chương trình Đại số 7. Nếu hai đại lượng x và y liên hệ với nhau theo công thức y = a/x (với a là hằng số khác 0), thì ta nói y tỷ lệ nghịch với x theo hệ số tỷ lệ a.

Đặc điểm cốt lõi là: khi một đại lượng tăng lên bao nhiêu lần thì đại lượng kia giảm đi bấy nhiêu lần, và tích của hai giá trị tương ứng luôn không đổi: x₁ · y₁ = x₂ · y₂ = a.

Ứng dụng thực tế: Trên cùng một quãng đường từ nhà đến trường (s không đổi), nếu đi xe đạp với vận tốc v nhanh gấp đôi thì thời gian t sẽ giảm đi một nửa. Ngược lại, nếu đi bộ chậm thì thời gian di chuyển sẽ tăng lên tương ứng.`,
    reflection: 'Em cần luyện tập vẽ đồ thị và bảng biến thiên để hình dung mối quan hệ tỷ lệ nghịch trực quan hơn.',
    teacherName: 'Thầy Quang'
  },
  {
    id: 'rev-3',
    studentId: 'usr_student_1',
    studentName: 'Minh Anh',
    studentClass: 'Lớp 7A1',
    studentAvatar: 'MA',
    subject: 'Ngữ Văn',
    title: 'Cảm nghĩ sâu sắc về bài thơ "Đồng Dao Mùa Xuân" của Nguyễn Khoa Điềm',
    chapter: 'Văn học Việt Nam hiện đại (Sách Ngữ Văn 7)',
    feedback: 'Bài viết rất giàu cảm xúc, phân tích hình ảnh người lính trẻ rất sắc sảo và chạm đến trái tim người đọc! Lời văn mượt mà, cảm thụ tinh tế.',
    deadline: 'Đã hoàn thành',
    status: 'completed',
    score: 9.5,
    date: '20/08/2026',
    submittedAt: '16:00 20/08',
    myText: `Bài thơ "Đồng dao mùa xuân" của nhà thơ Nguyễn Khoa Điềm đã khắc họa một tượng đài bất tử về người lính trẻ thời kỳ kháng chiến chống Mỹ cứu nước. Người lính ấy bước vào chiến trường khi tuổi đời còn rất trẻ, "chưa một lần yêu, cà phê chưa từng uống, còn mê thả diều".

Thế nhưng, trước tiếng gọi thiêng liêng của Tổ quốc, anh đã gác lại những ước mơ tuổi thanh xuân để dấn thân vào bom đạn khốc liệt. Và rồi, anh đã ngã xuống trong một trận đánh ác liệt giữa đại ngàn Trường Sơn: "Một ngày hòa bình / Anh không về nữa".

Hình ảnh người lính nằm lại giữa rừng sâu với chiếc ba lô con cóc, tấm áo màu xanh hòa vào cỏ cây và nụ cười hiền hậu làm rung động trái tim bao thế hệ độc giả. Tác giả đã sử dụng thể thơ bốn chữ với nhịp điệu dồn dập như một khúc đồng dao ru giấc ngủ ngàn thu của người anh hùng, biến sự hy sinh bi tráng trở thành mùa xuân vĩnh cửu của đất nước.`,
    reflection: 'Bài thơ khơi dậy trong em lòng biết ơn vô hạn đối với các anh hùng liệt sĩ. Hòa bình hôm nay được đánh đổi bằng xương máu và tuổi xuân của biết bao thế hệ cha anh, em tự nhắc nhở mình phải chăm ngoan, học giỏi để xứng đáng với sự hy sinh ấy.',
    teacherName: 'Cô Hoàng Mai',
    parentReaction: '❤️ Tự hào về con!',
    parentComment: 'Mẹ đọc bài văn con viết mà rơi nước mắt vì xúc động. Con gái của mẹ đã trưởng thành và biết suy nghĩ sâu sắc lắm!'
  },
  {
    id: 'rev-4',
    studentId: 'usr_student_2',
    studentName: 'Đức Huy',
    studentClass: 'Lớp 7A1',
    studentAvatar: 'DH',
    subject: 'Khoa học Tự nhiên',
    title: 'Khám phá bí mật quá trình quang hợp và vai trò của lá cây',
    chapter: 'Sinh học lớp 7 - Chương Trao đổi chất (Trang 82 - 90)',
    feedback: 'Đang đợi cô Hoàng Mai chấm và góp ý.',
    deadline: 'Chờ duyệt',
    status: 'reviewing',
    date: '25/08/2026',
    submittedAt: '08:45 25/08',
    myText: `Quang hợp là quá trình sinh hóa kỳ diệu bậc nhất của tự nhiên, biến đổi năng lượng ánh sáng mặt trời thành năng lượng hóa học dưới dạng các hợp chất hữu cơ (đặc biệt là đường glucose).

Phương trình tổng quát: Khí Carbonic (CO₂) + Nước (H₂O) + Ánh sáng mặt trời (qua diệp lục) ➔ Glucose (C₆H₁₂O₆) + Khí Oxy (O₂).

Cơ quan thực hiện chính là lá cây, nhờ cấu trúc phiến lá mỏng, diện tích bề mặt lớn và hàng triệu khí khổng ở mặt dưới lá giúp trao đổi khí liên tục. Lục lạp chứa chất diệp lục có khả năng hấp thụ các photon ánh sáng và kích hoạt chuỗi truyền điện tử. Không có quang hợp, Trái Đất sẽ không có oxy để các sinh vật hô hấp và toàn bộ chuỗi thức ăn sẽ sụp đổ.`,
    reflection: 'Chúng ta cần bảo vệ rừng nguyên sinh và tích cực trồng cây xanh xung quanh khuôn viên trường học để giữ cho bầu không khí luôn trong lành.',
    teacherName: 'Cô Hoàng Mai'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
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

export const INITIAL_REWARDS: RewardItem[] = [
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

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
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
