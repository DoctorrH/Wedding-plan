import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  writeBatch 
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
  await firebaseSignOut(auth);
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
