import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ReviewItem, AppNotification, TaskItem, RewardItem } from './types';
import { INITIAL_REVIEWS, INITIAL_NOTIFICATIONS, INITIAL_TASKS, INITIAL_REWARDS } from './data';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with configured custom database ID or default
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Collection references
export const reviewsCollection = collection(db, 'reviews');
export const notificationsCollection = collection(db, 'notifications');
export const tasksCollection = collection(db, 'tasks');
export const rewardsCollection = collection(db, 'rewards');

/**
 * Initialize Firestore data if empty with preset educational reviews & demo records
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const reviewsSnap = await getDocs(reviewsCollection);
    if (reviewsSnap.empty) {
      console.log('Seeding initial reviews into Firestore...');
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, 'reviews', rev.id), {
          ...rev,
          createdAt: serverTimestamp()
        });
      }
    }

    const notifSnap = await getDocs(notificationsCollection);
    if (notifSnap.empty) {
      for (const notif of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', notif.id), {
          ...notif,
          createdAt: serverTimestamp()
        });
      }
    }

    const taskSnap = await getDocs(tasksCollection);
    if (taskSnap.empty) {
      for (const task of INITIAL_TASKS) {
        await setDoc(doc(db, 'tasks', task.id), task);
      }
    }

    const rewardSnap = await getDocs(rewardsCollection);
    if (rewardSnap.empty) {
      for (const rew of INITIAL_REWARDS) {
        await setDoc(doc(db, 'rewards', rew.id), rew);
      }
    }
  } catch (error) {
    console.warn('Could not seed initial data to Firestore (will use local fallback):', error);
  }
}

/**
 * Real-time listener for Reviews
 */
export function subscribeToReviews(onUpdate: (reviews: ReviewItem[]) => void): Unsubscribe {
  const q = query(reviewsCollection);
  return onSnapshot(
    q,
    snapshot => {
      if (!snapshot.empty) {
        const list: ReviewItem[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as ReviewItem;
          list.push({ ...data, id: docSnap.id });
        });
        // Sort newest first by submittedAt / id
        list.sort((a, b) => b.id.localeCompare(a.id));
        onUpdate(list);
      }
    },
    error => {
      console.warn('Firestore reviews snapshot error:', error);
    }
  );
}

/**
 * Real-time listener for Notifications
 */
export function subscribeToNotifications(onUpdate: (notifs: AppNotification[]) => void): Unsubscribe {
  const q = query(notificationsCollection);
  return onSnapshot(
    q,
    snapshot => {
      if (!snapshot.empty) {
        const list: AppNotification[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as AppNotification;
          list.push({ ...data, id: docSnap.id });
        });
        list.sort((a, b) => b.id.localeCompare(a.id));
        onUpdate(list);
      }
    },
    error => {
      console.warn('Firestore notifications snapshot error:', error);
    }
  );
}

/**
 * Real-time listener for Tasks
 */
export function subscribeToTasks(onUpdate: (tasks: TaskItem[]) => void): Unsubscribe {
  return onSnapshot(
    tasksCollection,
    snapshot => {
      if (!snapshot.empty) {
        const list: TaskItem[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...(docSnap.data() as TaskItem), id: docSnap.id });
        });
        onUpdate(list);
      }
    },
    error => {
      console.warn('Firestore tasks snapshot error:', error);
    }
  );
}

/**
 * Real-time listener for Rewards
 */
export function subscribeToRewards(onUpdate: (rewards: RewardItem[]) => void): Unsubscribe {
  return onSnapshot(
    rewardsCollection,
    snapshot => {
      if (!snapshot.empty) {
        const list: RewardItem[] = [];
        snapshot.forEach(docSnap => {
          list.push({ ...(docSnap.data() as RewardItem), id: docSnap.id });
        });
        onUpdate(list);
      }
    },
    error => {
      console.warn('Firestore rewards snapshot error:', error);
    }
  );
}

/**
 * Save new review to Firestore (Realtime syncs to all users)
 */
export async function createReviewInFirestore(review: ReviewItem): Promise<void> {
  await setDoc(doc(db, 'reviews', review.id), {
    ...review,
    createdAt: serverTimestamp()
  });
}

/**
 * Update review in Firestore (Teacher grade, student revision, parent comment)
 */
export async function updateReviewInFirestore(reviewId: string, updates: Partial<ReviewItem>): Promise<void> {
  await updateDoc(doc(db, 'reviews', reviewId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

/**
 * Create notification in Firestore
 */
export async function createNotificationInFirestore(notif: AppNotification): Promise<void> {
  await setDoc(doc(db, 'notifications', notif.id), {
    ...notif,
    createdAt: serverTimestamp()
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationReadInFirestore(notifId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notifId), {
    read: true
  });
}
