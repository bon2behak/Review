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
