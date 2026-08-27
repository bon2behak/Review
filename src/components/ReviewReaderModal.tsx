import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Copy,
  Printer,
  ZoomIn,
  ZoomOut,
  Type,
  BookOpen,
  Heart,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Edit3,
  Sparkles,
  Share2
} from 'lucide-react';
import { ReviewItem, UserProfile } from '../types';

interface ReviewReaderModalProps {
  review: ReviewItem | null;
  currentUser: UserProfile;
  onClose: () => void;
  onGrade?: (review: ReviewItem) => void;
  onCheer?: (reviewId: string, reaction: string, comment?: string) => void;
  onEdit?: (review: ReviewItem) => void;
  onShowToast: (message: string) => void;
}

export const ReviewReaderModal: React.FC<ReviewReaderModalProps> = ({
  review,
  currentUser,
  onClose,
  onGrade,
  onCheer,
  onEdit,
  onShowToast
}) => {
  const [fontSize, setFontSize] = useState<number>(20); // Default 20px (Comfortable, large, easy-to-read)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [parentComment, setParentComment] = useState<string>('');
  const [selectedQuickReaction, setSelectedQuickReaction] = useState<string>('❤️ Rất tự hào về con!');

  // Reset speech when modal closes or review changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [review]);

  if (!review) return null;

  // Word count & reading time estimate
  const wordCount = review.myText ? review.myText.trim().split(/\s+/).length : 0;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));

  // Speech synthesis
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      onShowToast('Trình duyệt của bạn không hỗ trợ tính năng đọc giọng nói tự động.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onShowToast('Đã dừng đọc giọng nói.');
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${review.title}. Môn học ${review.subject}. Tác giả ${review.studentName}. Nội dung: ${review.myText}. ${
        review.reflection ? `Cảm nhận rút ra: ${review.reflection}` : ''
      }`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
      onShowToast('🔊 Đang đọc to bài review qua giọng nói...');
    }
  };

  // Copy full content
  const handleCopy = () => {
    const fullText = `【BÀI REVIEW BÀI HỌC】\nTiêu đề: ${review.title}\nMôn: ${review.subject} - ${review.chapter}\nTác giả: ${review.studentName} (${review.studentClass})\nNộp lúc: ${review.submittedAt}\n\nNỘI DUNG CHI TIẾT:\n${review.myText}\n\nCẢM NHẬN & BÀI HỌC RÚT RA:\n${review.reflection || 'Chưa có'}\n\nĐÁNH GIÁ CỦA GIÁO VIÊN (${review.teacherName || 'Giáo viên'}):\n${review.feedback || 'Chờ duyệt'}${review.score ? ` (Điểm: ${review.score}/10)` : ''}`;
    navigator.clipboard.writeText(fullText);
    onShowToast('📋 Đã sao chép toàn bộ nội dung bài review vào bộ nhớ tạm!');
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Submit Parent cheer from reader
  const handleSendCheer = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCheer) {
      onCheer(review.id, selectedQuickReaction, parentComment);
      setParentComment('');
    }
  };

  return (
    <div
      id="modal-review-reader"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* TOP TOOLBAR & CONTROLS */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-7 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Chế độ đọc chi tiết bài viết
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {review.subject} • {review.chapter}
              </span>
            </div>
          </div>

          {/* READER TOOLBAR: FONT SIZE & AUDIO */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs gap-1.5">
              <span className="text-xs font-bold text-slate-500 px-1 flex items-center gap-1">
                <Type className="w-4 h-4 text-blue-600" /> Cỡ chữ:
              </span>
              <button
                onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
                title="Giảm cỡ chữ (A-)"
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                A-
              </button>
              <span className="text-xs sm:text-sm font-extrabold text-blue-700 min-w-9 text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                title="Tăng cỡ chữ (A+)"
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-sm font-black text-slate-900 transition cursor-pointer"
              >
                A+
              </button>
            </div>

            {/* Read Aloud Text-to-Speech */}
            <button
              onClick={handleToggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Nghe đọc to nội dung bài review bằng giọng nói tiếng Việt"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
              <span>{isSpeaking ? 'Dừng đọc' : 'Đọc bài (Giọng nói)'}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition cursor-pointer"
              title="Sao chép toàn bộ nội dung"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="hidden sm:flex p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition cursor-pointer"
              title="In bài review"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition cursor-pointer ml-1"
              title="Đóng cửa sổ đọc"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-9 space-y-6 sm:space-y-8 bg-white">
          {/* HEADER INFO: AUTHOR & STATUS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-md">
                {review.studentAvatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{review.studentName}</h3>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {review.studentClass}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Nộp lúc {review.submittedAt}
                  </span>
                  <span>•</span>
                  <span>Ước tính: ~{wordCount} từ ({estimatedReadMinutes} phút đọc)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-extrabold px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${
                  review.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : review.status === 'needs_revision'
                    ? 'bg-orange-50 text-orange-800 border-orange-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {review.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đạt chuẩn • {review.score}/10 ⭐</span>
                  </>
                ) : review.status === 'needs_revision' ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span>Cần chỉnh sửa lại</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Đang chờ giáo viên chấm</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* ARTICLE TITLE */}
          <div>
            <div className="inline-block text-xs font-bold text-blue-700 bg-blue-100/70 px-3 py-1 rounded-lg mb-2">
              Môn: {review.subject} — {review.chapter}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {review.title}
            </h1>
          </div>

          {/* MAIN REVIEW TEXT (COMFORTABLE SCALED FONT SIZE & LINE HEIGHT) */}
          <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span>✍️ Nội dung review & Tóm tắt bài học</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Cỡ chữ hiện tại: {fontSize}px</span>
            </div>

            <div
              className="text-slate-900 font-normal leading-relaxed whitespace-pre-line tracking-normal"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            >
              {review.myText}
            </div>
          </div>

          {/* PERSONAL REFLECTION & LESSON LEARNED (CẢM NHẬN RÚT RA) */}
          {review.reflection && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl p-6 sm:p-7 border border-indigo-100 shadow-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl">💡</span>
                <h4 className="text-base sm:text-lg font-extrabold text-indigo-950">
                  Cảm nhận cá nhân &amp; Bài học tâm đắc rút ra:
                </h4>
              </div>
              <p
                className="text-indigo-950 font-medium leading-relaxed italic pl-4 border-l-4 border-indigo-500"
                style={{ fontSize: `${Math.max(16, fontSize - 2)}px`, lineHeight: 1.7 }}
              >
                &ldquo;{review.reflection}&rdquo;
              </p>
            </div>
          )}

          {/* TEACHER'S EVALUATION & FEEDBACK */}
          <div className="bg-purple-50/70 rounded-3xl p-6 sm:p-7 border border-purple-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center text-base font-bold shadow-xs">
                  👩‍🏫
                </span>
                <div>
                  <h4 className="text-base font-bold text-purple-950">
                    Đánh giá từ {review.teacherName || 'Giáo viên bộ môn'}
                  </h4>
                  <p className="text-xs text-purple-600 font-medium">Phản hồi chính thức trên hệ thống</p>
                </div>
              </div>

              {review.score !== undefined && (
                <div className="bg-white px-4 py-2 rounded-xl border border-purple-200 text-purple-900 font-black text-sm sm:text-base flex items-center gap-1.5 shadow-2xs">
                  <span>Điểm số:</span>
                  <span className="text-purple-700 text-lg font-black">{review.score}/10 ⭐</span>
                </div>
              )}
            </div>

            <p
              className="text-purple-950 bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 italic leading-relaxed"
              style={{ fontSize: `${Math.max(15, fontSize - 3)}px`, lineHeight: 1.7 }}
            >
              &ldquo;{review.feedback || 'Bài viết đang chờ thầy cô xem xét và phản hồi.'}&rdquo;
            </p>

            {/* Quick Action for Teacher */}
            {currentUser.role === 'teacher' && onGrade && (
              <div className="mt-4 pt-3 border-t border-purple-200/60 flex items-center justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onGrade(review);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Chấm điểm &amp; Viết lại nhận xét
                </button>
              </div>
            )}
          </div>

          {/* PARENT INTERACTION & CHEERING SECTION */}
          <div className="bg-rose-50/70 rounded-3xl p-6 sm:p-7 border border-rose-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-3.5">
              <span className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center text-base font-bold shadow-xs">
                👨‍👩‍👧
              </span>
              <div>
                <h4 className="text-base font-bold text-rose-950">Góc Phụ Huynh Đồng Hành</h4>
                <p className="text-xs text-rose-600 font-medium">Lời chúc &amp; Động viên từ Ba Mẹ</p>
              </div>
            </div>

            {review.parentReaction ? (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-rose-900 flex items-center gap-1.5">
                    <span>{review.parentReaction}</span>
                  </p>
                  {review.parentComment && (
                    <p
                      className="text-slate-800 italic mt-2 leading-relaxed"
                      style={{ fontSize: `${Math.max(15, fontSize - 3)}px`, lineHeight: 1.7 }}
                    >
                      &ldquo;{review.parentComment}&rdquo;
                    </p>
                  )}
                </div>
                <span className="text-xs text-rose-500 font-bold px-2.5 py-1 rounded-lg bg-rose-50 shrink-0">
                  Đã ghi nhận
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic mb-3 bg-white/60 p-3 rounded-xl">
                Chưa có phản hồi từ phụ huynh. Ba mẹ có thể gửi lời động viên ngay bên dưới!
              </p>
            )}

            {/* Parent Cheer Form */}
            {onCheer && (
              <form onSubmit={handleSendCheer} className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-600 mr-1">Chọn lời khen nhanh:</span>
                  {[
                    '❤️ Rất tự hào về con!',
                    '🌟 Con viết rất sâu sắc!',
                    '🍦 Tối nay mẹ thưởng kem nhé!',
                    '📚 Cố gắng phát huy con yêu!'
                  ].map((reaction, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setSelectedQuickReaction(reaction)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer ${
                        selectedQuickReaction === reaction
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {reaction}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhắn thêm lời dặn dò hoặc khen ngợi con..."
                    value={parentComment}
                    onChange={e => setParentComment(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" /> Gửi động viên
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {currentUser.role === 'student' && review.studentId === currentUser.id && review.status === 'needs_revision' && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(review);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Sửa & Nộp lại bài viết (+15 ⭐)
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition cursor-pointer ml-auto"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
