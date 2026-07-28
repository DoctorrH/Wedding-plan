import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { WeddingDetails, TaskItem, GuestItem, TaskCategory } from '../types';
import { initialWeddingDetails, initialTasks, initialGuests } from '../data/initialData';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if provided
const config = firebaseConfig as Record<string, any>;
const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };

// Auth Helper Functions
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
  onAuthStateChanged, 
  updateProfile 
};
export type { User };

export async function signOutUser() {
  localStorage.removeItem('wedding_local_guest');
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    // Ignore if not signed in via firebase
  }
}

export async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.warn('Anonymous auth failed:', err);
    }
  }
}

// Helpers for user-isolated Firestore paths
function getUserUid(userId?: string) {
  return userId || auth.currentUser?.uid || 'anonymous';
}

function getUserDocRef(docName: string, userId?: string) {
  return doc(db, 'users', getUserUid(userId), 'data', docName);
}

function getUserCollRef(collName: string, userId?: string) {
  return collection(db, 'users', getUserUid(userId), collName);
}

// Realtime Listeners with Automatic Initial Data Seeding per User
export function subscribeWeddingDetails(callback: (details: WeddingDetails) => void, userId?: string) {
  const userDocRef = getUserDocRef('wedding_details', userId);
  return onSnapshot(userDocRef, async (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as WeddingDetails);
    } else {
      // Seed default details if empty for this user
      await setDoc(userDocRef, initialWeddingDetails);
      callback(initialWeddingDetails);
    }
  }, (error) => {
    console.error('Error fetching wedding details from Firestore:', error);
  });
}

export function saveWeddingDetailsToDb(details: WeddingDetails, userId?: string) {
  const userDocRef = getUserDocRef('wedding_details', userId);
  return setDoc(userDocRef, details, { merge: true });
}

export function subscribeCategoryNames(callback: (names: Record<TaskCategory, string>) => void, userId?: string) {
  const defaultCategories: Record<TaskCategory, string> = {
    LE_GIA_TIEN: 'Lễ Gia Tiên & Ăn Hỏi',
    TRANG_PHUC: 'Trang Phục & Trang Điểm',
    TIEC_CUOI: 'Tiệc Cưới & Thực Đơn',
    CHUP_ANH: 'Chụp Ảnh & Quay Phim',
    THIEP_MOI: 'Thiệp Mời & Khách Mời',
    NHAN_CUOI: 'Nhẫn Cưới & Trang Sức',
    XE_HOA_DECOR: 'Xe Hoa & Trang Trí',
    KHAC: 'Chi Phí Khác',
  };

  const categoriesDocRef = getUserDocRef('wedding_categories', userId);

  return onSnapshot(categoriesDocRef, async (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as Record<TaskCategory, string>);
    } else {
      await setDoc(categoriesDocRef, defaultCategories);
      callback(defaultCategories);
    }
  }, (error) => {
    console.error('Error fetching category names from Firestore:', error);
  });
}

export function saveCategoryNamesToDb(names: Record<TaskCategory, string>, userId?: string) {
  const categoriesDocRef = getUserDocRef('wedding_categories', userId);
  return setDoc(categoriesDocRef, names, { merge: true });
}

export function subscribeTasks(callback: (tasks: TaskItem[]) => void, userId?: string) {
  const tasksCollRef = getUserCollRef('tasks', userId);
  const metaDocRef = getUserDocRef('meta', userId);

  return onSnapshot(tasksCollRef, async (snapshot) => {
    const items: TaskItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as TaskItem);
    });

    try {
      const metaSnap = await getDoc(metaDocRef);
      const isSeeded = metaSnap.exists() && metaSnap.data()?.tasksSeeded;

      if (!isSeeded) {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          initialTasks.forEach((task) => {
            const docRef = doc(tasksCollRef, task.id);
            const { id, ...rest } = task;
            batch.set(docRef, rest);
          });
          await batch.commit();
          await setDoc(metaDocRef, { tasksSeeded: true }, { merge: true });
          callback(initialTasks);
          return;
        } else {
          await setDoc(metaDocRef, { tasksSeeded: true }, { merge: true });
        }
      }

      callback(items);
    } catch (err) {
      console.error('Error fetching tasks from Firestore:', err);
      callback(items);
    }
  }, (error) => {
    console.error('Error fetching tasks from Firestore:', error);
  });
}

export function saveTaskToDb(task: Omit<TaskItem, 'id'>, taskId?: string, userId?: string) {
  const tasksCollRef = getUserCollRef('tasks', userId);
  if (taskId) {
    const docRef = doc(tasksCollRef, taskId);
    return setDoc(docRef, task, { merge: true });
  } else {
    const docRef = doc(tasksCollRef); // Auto-generated ID
    return setDoc(docRef, task);
  }
}

export function deleteTaskFromDb(taskId: string, userId?: string) {
  const tasksCollRef = getUserCollRef('tasks', userId);
  return deleteDoc(doc(tasksCollRef, taskId));
}

export function subscribeGuests(callback: (guests: GuestItem[]) => void, userId?: string) {
  const guestsCollRef = getUserCollRef('guests', userId);
  const metaDocRef = getUserDocRef('meta', userId);

  return onSnapshot(guestsCollRef, async (snapshot) => {
    const items: GuestItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as GuestItem);
    });

    try {
      const metaSnap = await getDoc(metaDocRef);
      const isSeeded = metaSnap.exists() && metaSnap.data()?.guestsSeeded;

      if (!isSeeded) {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          initialGuests.forEach((guest) => {
            const docRef = doc(guestsCollRef, guest.id);
            const { id, ...rest } = guest;
            batch.set(docRef, rest);
          });
          await batch.commit();
          await setDoc(metaDocRef, { guestsSeeded: true }, { merge: true });
          callback(initialGuests);
          return;
        } else {
          await setDoc(metaDocRef, { guestsSeeded: true }, { merge: true });
        }
      }

      callback(items);
    } catch (err) {
      console.error('Error fetching guests from Firestore:', err);
      callback(items);
    }
  }, (error) => {
    console.error('Error fetching guests from Firestore:', error);
  });
}

export function saveGuestToDb(guest: Omit<GuestItem, 'id'>, guestId?: string, userId?: string) {
  const guestsCollRef = getUserCollRef('guests', userId);
  if (guestId) {
    const docRef = doc(guestsCollRef, guestId);
    return setDoc(docRef, guest, { merge: true });
  } else {
    const docRef = doc(guestsCollRef);
    return setDoc(docRef, guest);
  }
}

export function deleteGuestFromDb(guestId: string, userId?: string) {
  const guestsCollRef = getUserCollRef('guests', userId);
  return deleteDoc(doc(guestsCollRef, guestId));
}

// Share & Copy Data Code Logic
export interface ShareDataPayload {
  code: string;
  createdAt: string;
  createdByName: string;
  weddingDetails: WeddingDetails;
  categoryNames: Record<TaskCategory, string>;
  tasks: TaskItem[];
  guests: GuestItem[];
}

export function generateRandomCode(length = 6): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createShareCode(data: {
  weddingDetails: WeddingDetails;
  categoryNames: Record<TaskCategory, string>;
  tasks: TaskItem[];
  guests: GuestItem[];
}): Promise<string> {
  await ensureAuth();
  
  let attempts = 0;
  let shareCode = '';
  let docRef;

  while (attempts < 5) {
    shareCode = generateRandomCode(6);
    docRef = doc(db, 'shares', shareCode);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      break;
    }
    attempts++;
  }

  const payload: ShareDataPayload = {
    code: shareCode,
    createdAt: new Date().toISOString(),
    createdByName: `${data.weddingDetails.groomName || 'Chú rể'} & ${data.weddingDetails.brideName || 'Cô dâu'}`,
    weddingDetails: data.weddingDetails,
    categoryNames: data.categoryNames,
    tasks: data.tasks,
    guests: data.guests,
  };

  await setDoc(docRef!, payload);
  return shareCode;
}

export async function getShareData(code: string): Promise<ShareDataPayload | null> {
  await ensureAuth();
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  const docRef = doc(db, 'shares', cleanCode);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data() as ShareDataPayload;
  }
  return null;
}

export async function importShareDataToUser(payload: ShareDataPayload, userId?: string): Promise<void> {
  await ensureAuth();
  const uid = getUserUid(userId);

  // 1. Save Wedding Details & Categories
  await saveWeddingDetailsToDb(payload.weddingDetails, uid);
  await saveCategoryNamesToDb(payload.categoryNames, uid);

  // 2. Clear existing user tasks and write new ones
  const tasksCollRef = getUserCollRef('tasks', uid);
  const existingTasksSnap = await getDocs(tasksCollRef);
  
  const batch1 = writeBatch(db);
  existingTasksSnap.forEach((docSnap) => {
    batch1.delete(docSnap.ref);
  });
  await batch1.commit();

  // Write imported tasks
  if (payload.tasks && payload.tasks.length > 0) {
    const batch2 = writeBatch(db);
    payload.tasks.forEach((task) => {
      const taskDocRef = doc(tasksCollRef, task.id || doc(tasksCollRef).id);
      const { id, ...rest } = task;
      batch2.set(taskDocRef, rest);
    });
    await batch2.commit();
  }

  // 3. Clear existing user guests and write new ones
  const guestsCollRef = getUserCollRef('guests', uid);
  const existingGuestsSnap = await getDocs(guestsCollRef);

  const batch3 = writeBatch(db);
  existingGuestsSnap.forEach((docSnap) => {
    batch3.delete(docSnap.ref);
  });
  await batch3.commit();

  // Write imported guests
  if (payload.guests && payload.guests.length > 0) {
    const batch4 = writeBatch(db);
    payload.guests.forEach((guest) => {
      const guestDocRef = doc(guestsCollRef, guest.id || doc(guestsCollRef).id);
      const { id, ...rest } = guest;
      batch4.set(guestDocRef, rest);
    });
    await batch4.commit();
  }

  // 4. Mark meta doc as seeded
  const metaDocRef = getUserDocRef('meta', uid);
  await setDoc(metaDocRef, { tasksSeeded: true, guestsSeeded: true }, { merge: true });
}

