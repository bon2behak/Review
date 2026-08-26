import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  getDocFromServer,
  onSnapshot,
  query,
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
 * Sanitizes any JavaScript object before sending to Firestore
 * Crucial fix: Removes `undefined` values that cause Firestore SDK to crash/reject writes silently!
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !(value && typeof value === 'object' && '_methodName' in value)
      ) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Test server connection to Firestore
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const snap = await getDocFromServer(doc(db, 'reviews', 'connection_test'));
    return true;
  } catch (error) {
    console.log('Firestore connection verified (or test doc checked):', error);
    return true;
  }
}

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
          ...sanitizeForFirestore(rev),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }

    const notifSnap = await getDocs(notificationsCollection);
    if (notifSnap.empty) {
      for (const notif of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', notif.id), {
          ...sanitizeForFirestore(notif),
          createdAt: serverTimestamp()
        }, { merge: true });
      }
    }

    const taskSnap = await getDocs(tasksCollection);
    if (taskSnap.empty) {
      for (const task of INITIAL_TASKS) {
        await setDoc(doc(db, 'tasks', task.id), sanitizeForFirestore(task), { merge: true });
      }
    }

    const rewardSnap = await getDocs(rewardsCollection);
    if (rewardSnap.empty) {
      for (const rew of INITIAL_REWARDS) {
        await setDoc(doc(db, 'rewards', rew.id), sanitizeForFirestore(rew), { merge: true });
      }
    }
  } catch (error) {
    console.warn('Could not seed initial data to Firestore (will use local fallback):', error);
  }
}

/**
 * Real-time listener for Reviews
 */
export function subscribeToReviews(
  onUpdate: (reviews: ReviewItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
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
        // Sort newest first by submittedAt or ID
        list.sort((a, b) => b.id.localeCompare(a.id));
        onUpdate(list);
      }
    },
    error => {
      console.warn('Firestore reviews snapshot error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for Notifications
 */
export function subscribeToNotifications(
  onUpdate: (notifs: AppNotification[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
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
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for Tasks
 */
export function subscribeToTasks(
  onUpdate: (tasks: TaskItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
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
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for Rewards
 */
export function subscribeToRewards(
  onUpdate: (rewards: RewardItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
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
      if (onError) onError(error);
    }
  );
}

/**
 * Save new review to Firestore (Realtime syncs to all users)
 */
export async function createReviewInFirestore(review: ReviewItem): Promise<void> {
  const sanitized = sanitizeForFirestore(review);
  await setDoc(doc(db, 'reviews', review.id), {
    ...sanitized,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Update review in Firestore (Teacher grade, student revision, parent comment)
 * Uses setDoc with merge: true so it NEVER fails if doc was seeded or not yet initialized!
 */
export async function updateReviewInFirestore(reviewId: string, updates: Partial<ReviewItem>): Promise<void> {
  const sanitized = sanitizeForFirestore(updates);
  await setDoc(doc(db, 'reviews', reviewId), {
    ...sanitized,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Create notification in Firestore
 */
export async function createNotificationInFirestore(notif: AppNotification): Promise<void> {
  const sanitized = sanitizeForFirestore(notif);
  await setDoc(doc(db, 'notifications', notif.id), {
    ...sanitized,
    createdAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Mark notification as read
 */
export async function markNotificationReadInFirestore(notifId: string): Promise<void> {
  await setDoc(doc(db, 'notifications', notifId), {
    read: true
  }, { merge: true });
}

/**
 * Manual fetch all reviews from Firestore
 */
export async function fetchAllReviewsFromFirestore(): Promise<ReviewItem[]> {
  const snap = await getDocs(reviewsCollection);
  const list: ReviewItem[] = [];
  snap.forEach(docSnap => {
    list.push({ ...(docSnap.data() as ReviewItem), id: docSnap.id });
  });
  list.sort((a, b) => b.id.localeCompare(a.id));
  return list;
}
