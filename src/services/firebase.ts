import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment,
  Firestore
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject,
  FirebaseStorage
} from 'firebase/storage';

import { firebaseConfig, isFirebaseConfigured } from '../firebaseConfig.js';
import { AppItem, ReviewItem, UserPublicProfile, UserPrivateData, ReportItem, AppStatus } from '../types';
import { INITIAL_MOCK_APPS, INITIAL_MOCK_REVIEWS } from '../data/mockData';
import { ADMIN_EMAILS } from '../config.js';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const isConfigured = isFirebaseConfigured();

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully with live config.");
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to mock mode:", error);
  }
}

// ---------------- LOCAL STORAGE MOCK ENGINE ----------------
const MOCK_STORAGE_KEY_APPS = 'droidstore_mock_apps_v2';
const MOCK_STORAGE_KEY_REVIEWS = 'droidstore_mock_reviews_v2';
const MOCK_STORAGE_KEY_REPORTS = 'droidstore_mock_reports_v2';
const MOCK_STORAGE_KEY_BANS = 'droidstore_mock_banned_v2';
const MOCK_STORAGE_KEY_USERS = 'droidstore_mock_users_v2';

const getLocalApps = (): AppItem[] => {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_APPS);
    if (!raw) {
      localStorage.setItem(MOCK_STORAGE_KEY_APPS, JSON.stringify(INITIAL_MOCK_APPS));
      return INITIAL_MOCK_APPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_APPS;
  }
};

const saveLocalApps = (apps: AppItem[]) => {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY_APPS, JSON.stringify(apps));
  } catch (e) {
    console.error("Local storage error:", e);
  }
};

const getLocalReviews = (): Record<string, ReviewItem[]> => {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_REVIEWS);
    if (!raw) {
      localStorage.setItem(MOCK_STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_MOCK_REVIEWS));
      return INITIAL_MOCK_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_REVIEWS;
  }
};

const saveLocalReviews = (reviews: Record<string, ReviewItem[]>) => {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error(e);
  }
};

// ---------------- EXPORTED API SERVICE METHODS ----------------

export const isLiveFirebase = () => {
  return isConfigured && auth !== null && db !== null;
};

// --- AUTHENTICATION ---
export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  if (isLiveFirebase() && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    // Check mock stored user
    const mockUserJson = localStorage.getItem('droidstore_mock_current_user');
    if (mockUserJson) {
      try {
        const u = JSON.parse(mockUserJson);
        callback(u);
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
    // Return dummy unlisten
    return () => {};
  }
};

export const signInWithGoogle = async (): Promise<any> => {
  if (isLiveFirebase() && auth) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Save public user profile if not exists
    await ensureUserProfile(result.user);
    return result.user;
  } else {
    // Simulate Google Sign In
    const mockGoogleUser = {
      uid: "user-demo-" + Math.floor(Math.random() * 8999 + 1000),
      email: "demo.developer@gmail.com",
      displayName: "Demo Developer",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
      emailVerified: true
    };
    localStorage.setItem('droidstore_mock_current_user', JSON.stringify(mockGoogleUser));
    await ensureUserProfile(mockGoogleUser as any);
    return mockGoogleUser;
  }
};

export const signInAdminDemo = async (): Promise<any> => {
  // Shortcut for testing admin privileges immediately
  const adminUser = {
    uid: "admin-ahmed-demo",
    email: ADMIN_EMAILS[0],
    displayName: "Ahmed (Lead Admin)",
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&auto=format&fit=crop&q=80",
    emailVerified: true
  };
  localStorage.setItem('droidstore_mock_current_user', JSON.stringify(adminUser));
  await ensureUserProfile(adminUser as any);
  return adminUser;
};

export const signInWithEmail = async (email: string, pass: string): Promise<any> => {
  if (isLiveFirebase() && auth) {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    await ensureUserProfile(res.user);
    return res.user;
  } else {
    const mockUser = {
      uid: "user-" + btoa(email).slice(0, 8),
      email,
      displayName: email.split('@')[0],
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80"
    };
    localStorage.setItem('droidstore_mock_current_user', JSON.stringify(mockUser));
    await ensureUserProfile(mockUser as any);
    return mockUser;
  }
};

export const signUpWithEmail = async (email: string, pass: string, name: string): Promise<any> => {
  if (isLiveFirebase() && auth) {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      await ensureUserProfile({ ...res.user, displayName: name } as any);
    }
    return res.user;
  } else {
    const mockUser = {
      uid: "user-" + btoa(email).slice(0, 8),
      email,
      displayName: name || email.split('@')[0],
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80"
    };
    localStorage.setItem('droidstore_mock_current_user', JSON.stringify(mockUser));
    await ensureUserProfile(mockUser as any);
    return mockUser;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (isLiveFirebase() && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    console.log("Mock password reset sent to:", email);
  }
};

export const logOut = async (): Promise<void> => {
  if (isLiveFirebase() && auth) {
    await fbSignOut(auth);
  }
  localStorage.removeItem('droidstore_mock_current_user');
};

// --- USER PROFILES (PUBLIC vs PRIVATE) ---
export const ensureUserProfile = async (user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null }) => {
  const publicData: UserPublicProfile = {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || "Android User",
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
    createdAt: Date.now(),
    isDeveloper: false
  };

  const privateData: UserPrivateData = {
    uid: user.uid,
    email: user.email || "",
    notificationEnabled: true,
    theme: 'light',
    language: 'en',
    createdAt: Date.now()
  };

  if (isLiveFirebase() && db) {
    try {
      const pubRef = doc(db, 'users', user.uid);
      const pubSnap = await getDoc(pubRef);
      if (!pubSnap.exists()) {
        await setDoc(pubRef, publicData);
      }

      if (user.email) {
        const privRef = doc(db, 'users_private', user.uid);
        const privSnap = await getDoc(privRef);
        if (!privSnap.exists()) {
          await setDoc(privRef, privateData);
        }
      }
    } catch (e) {
      console.warn("Profile sync error:", e);
    }
  } else {
    // Store in mock users
    try {
      const usersRaw = localStorage.getItem(MOCK_STORAGE_KEY_USERS);
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      if (!users[user.uid]) {
        users[user.uid] = { public: publicData, private: privateData };
        localStorage.setItem(MOCK_STORAGE_KEY_USERS, JSON.stringify(users));
      }
    } catch (e) {
      console.error(e);
    }
  }
};

export const getUserPublicProfile = async (uid: string): Promise<UserPublicProfile | null> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserPublicProfile;
      }
    } catch (e) {
      console.warn("Error getting public profile:", e);
    }
  }
  
  // Local fallback
  try {
    const usersRaw = localStorage.getItem(MOCK_STORAGE_KEY_USERS);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      if (users[uid]?.public) return users[uid].public;
    }
  } catch {}
  
  return {
    uid,
    displayName: "Android Developer",
    photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${uid}`,
    bio: "Passionate Android creator & developer.",
    createdAt: Date.now() - 86400000 * 30,
    isDeveloper: true
  };
};

export const updateUserPublicProfile = async (uid: string, data: Partial<UserPublicProfile>) => {
  if (isLiveFirebase() && db) {
    await updateDoc(doc(db, 'users', uid), data);
  } else {
    const usersRaw = localStorage.getItem(MOCK_STORAGE_KEY_USERS);
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    if (!users[uid]) users[uid] = { public: { uid, ...data }, private: {} };
    else users[uid].public = { ...users[uid].public, ...data };
    localStorage.setItem(MOCK_STORAGE_KEY_USERS, JSON.stringify(users));
  }
};

export const deleteUserAccount = async (uid: string) => {
  if (isLiveFirebase() && db) {
    await deleteDoc(doc(db, 'users', uid));
    await deleteDoc(doc(db, 'users_private', uid));
    if (auth?.currentUser) {
      await auth.currentUser.delete();
    }
  } else {
    const usersRaw = localStorage.getItem(MOCK_STORAGE_KEY_USERS);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      delete users[uid];
      localStorage.setItem(MOCK_STORAGE_KEY_USERS, JSON.stringify(users));
    }
    localStorage.removeItem('droidstore_mock_current_user');
  }
};

// --- APPS COLLECTION ---

export const getApprovedApps = async (): Promise<AppItem[]> => {
  if (isLiveFirebase() && db) {
    try {
      const q = query(collection(db, 'apps'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const apps: AppItem[] = [];
      snap.forEach(d => apps.push({ id: d.id, ...d.data() } as AppItem));
      return apps;
    } catch (e) {
      console.warn("Live fetch error, falling back to local apps:", e);
      return getLocalApps().filter(a => a.status === 'approved');
    }
  }
  return getLocalApps().filter(a => a.status === 'approved');
};

export const getAppById = async (appId: string): Promise<AppItem | null> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDoc(doc(db, 'apps', appId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as AppItem;
      }
    } catch (e) {
      console.warn(e);
    }
  }
  const local = getLocalApps().find(a => a.id === appId);
  return local || null;
};

export const recordDownload = async (appId: string): Promise<number> => {
  if (isLiveFirebase() && db) {
    try {
      const refDoc = doc(db, 'apps', appId);
      await updateDoc(refDoc, {
        downloads: increment(1)
      });
      const snap = await getDoc(refDoc);
      return snap.data()?.downloads || 0;
    } catch (e) {
      console.warn("Error incrementing download in firestore:", e);
    }
  }

  // Local fallback
  const apps = getLocalApps();
  const index = apps.findIndex(a => a.id === appId);
  if (index !== -1) {
    apps[index].downloads = (apps[index].downloads || 0) + 1;
    saveLocalApps(apps);
    return apps[index].downloads;
  }
  return 1;
};

export const submitApp = async (appData: Omit<AppItem, 'id'>): Promise<string> => {
  if (isLiveFirebase() && db) {
    const newDocRef = doc(collection(db, 'apps'));
    await setDoc(newDocRef, {
      ...appData,
      status: 'pending' // Enforced by rules
    });
    return newDocRef.id;
  }

  const apps = getLocalApps();
  const id = "app-" + Date.now();
  const newApp: AppItem = {
    ...appData,
    id,
    status: 'pending'
  };
  apps.unshift(newApp);
  saveLocalApps(apps);
  return id;
};

export const updateAppDetails = async (appId: string, updates: Partial<AppItem>): Promise<void> => {
  if (isLiveFirebase() && db) {
    await updateDoc(doc(db, 'apps', appId), {
      ...updates,
      updatedAt: Date.now()
    });
    return;
  }

  const apps = getLocalApps();
  const index = apps.findIndex(a => a.id === appId);
  if (index !== -1) {
    apps[index] = { ...apps[index], ...updates, updatedAt: Date.now() };
    saveLocalApps(apps);
  }
};

export const deleteApp = async (appId: string): Promise<void> => {
  if (isLiveFirebase() && db) {
    await deleteDoc(doc(db, 'apps', appId));
    return;
  }

  const apps = getLocalApps().filter(a => a.id !== appId);
  saveLocalApps(apps);
};

export const getUserApps = async (userId: string): Promise<AppItem[]> => {
  if (isLiveFirebase() && db) {
    try {
      const q = query(collection(db, 'apps'), where('uploaderId', '==', userId));
      const snap = await getDocs(q);
      const apps: AppItem[] = [];
      snap.forEach(d => apps.push({ id: d.id, ...d.data() } as AppItem));
      return apps;
    } catch (e) {
      console.warn("getUserApps firestore error:", e);
    }
  }
  return getLocalApps().filter(a => a.uploaderId === userId);
};

// --- ADMIN OPERATIONS ---
export const getPendingApps = async (): Promise<AppItem[]> => {
  if (isLiveFirebase() && db) {
    try {
      const q = query(collection(db, 'apps'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const apps: AppItem[] = [];
      snap.forEach(d => apps.push({ id: d.id, ...d.data() } as AppItem));
      return apps;
    } catch (e) {
      console.warn(e);
    }
  }
  return getLocalApps().filter(a => a.status === 'pending');
};

export const setAppStatus = async (appId: string, status: AppStatus, rejectionReason?: string): Promise<void> => {
  const updates: Partial<AppItem> = {
    status,
    rejectionReason: status === 'rejected' ? rejectionReason : undefined,
    updatedAt: Date.now()
  };

  if (isLiveFirebase() && db) {
    await updateDoc(doc(db, 'apps', appId), updates);
    return;
  }

  const apps = getLocalApps();
  const index = apps.findIndex(a => a.id === appId);
  if (index !== -1) {
    apps[index] = { ...apps[index], ...updates };
    saveLocalApps(apps);
  }
};

// --- REVIEWS ---
export const getAppReviews = async (appId: string): Promise<ReviewItem[]> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDocs(collection(db, 'apps', appId, 'reviews'));
      const revs: ReviewItem[] = [];
      snap.forEach(d => revs.push({ id: d.id, ...d.data() } as ReviewItem));
      return revs.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.warn(e);
    }
  }
  const allRevs = getLocalReviews();
  return (allRevs[appId] || []).sort((a, b) => b.createdAt - a.createdAt);
};

export const addOrUpdateAppReview = async (appId: string, review: ReviewItem): Promise<void> => {
  if (isLiveFirebase() && db) {
    // 1 review per user enforced by making document ID = userId
    await setDoc(doc(db, 'apps', appId, 'reviews', review.userId), review);
    
    // Recalculate average rating
    const snap = await getDocs(collection(db, 'apps', appId, 'reviews'));
    let total = 0;
    let count = 0;
    snap.forEach(d => {
      total += (d.data().rating || 5);
      count++;
    });
    const avg = count > 0 ? Number((total / count).toFixed(1)) : 5.0;
    await updateDoc(doc(db, 'apps', appId), {
      rating: avg,
      reviewCount: count
    });
    return;
  }

  // Local fallback
  const revs = getLocalReviews();
  if (!revs[appId]) revs[appId] = [];
  const existingIdx = revs[appId].findIndex(r => r.userId === review.userId);
  if (existingIdx !== -1) {
    revs[appId][existingIdx] = review;
  } else {
    revs[appId].unshift(review);
  }
  saveLocalReviews(revs);

  // Update app average rating
  const apps = getLocalApps();
  const appIdx = apps.findIndex(a => a.id === appId);
  if (appIdx !== -1) {
    const list = revs[appId];
    const avg = Number((list.reduce((acc, cur) => acc + cur.rating, 0) / list.length).toFixed(1));
    apps[appIdx].rating = avg;
    apps[appIdx].reviewCount = list.length;
    saveLocalApps(apps);
  }
};

export const deleteAppReview = async (appId: string, userId: string): Promise<void> => {
  if (isLiveFirebase() && db) {
    await deleteDoc(doc(db, 'apps', appId, 'reviews', userId));
    return;
  }

  const revs = getLocalReviews();
  if (revs[appId]) {
    revs[appId] = revs[appId].filter(r => r.userId !== userId);
    saveLocalReviews(revs);
    
    // Recompute app avg
    const apps = getLocalApps();
    const appIdx = apps.findIndex(a => a.id === appId);
    if (appIdx !== -1) {
      const list = revs[appId];
      apps[appIdx].rating = list.length > 0 ? Number((list.reduce((acc, cur) => acc + cur.rating, 0) / list.length).toFixed(1)) : 5.0;
      apps[appIdx].reviewCount = list.length;
      saveLocalApps(apps);
    }
  }
};

// --- REPORTS ---
export const submitReport = async (report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const newReport: ReportItem = {
    ...report,
    id: "rep-" + Date.now(),
    status: 'pending',
    createdAt: Date.now()
  };

  if (isLiveFirebase() && db) {
    const refDoc = doc(collection(db, 'reports'));
    await setDoc(refDoc, newReport);
    return refDoc.id;
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_REPORTS);
    const list: ReportItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(newReport);
    localStorage.setItem(MOCK_STORAGE_KEY_REPORTS, JSON.stringify(list));
  } catch {}
  return newReport.id;
};

export const getReports = async (): Promise<ReportItem[]> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDocs(collection(db, 'reports'));
      const list: ReportItem[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as ReportItem));
      return list;
    } catch (e) {
      console.warn(e);
    }
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_REPORTS);
    return raw ? JSON.parse(raw) : [
      {
        id: "rep-demo-1",
        appId: "app-pixel-craft",
        appName: "Pixel Craft 3D",
        reporterId: "user-123",
        reporterEmail: "user123@example.com",
        reason: "broken",
        details: "Occasional crash on Android 12 when loading textures.",
        status: "pending",
        createdAt: Date.now() - 3600000 * 5
      }
    ];
  } catch {
    return [];
  }
};

export const dismissReport = async (reportId: string): Promise<void> => {
  if (isLiveFirebase() && db) {
    await deleteDoc(doc(db, 'reports', reportId));
    return;
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_REPORTS);
    if (raw) {
      const list: ReportItem[] = JSON.parse(raw);
      const filtered = list.filter(r => r.id !== reportId);
      localStorage.setItem(MOCK_STORAGE_KEY_REPORTS, JSON.stringify(filtered));
    }
  } catch {}
};

// --- BANS ---
export const banUser = async (userId: string): Promise<void> => {
  if (isLiveFirebase() && db) {
    await setDoc(doc(db, 'banned_users', userId), {
      bannedAt: Date.now(),
      bannedBy: auth?.currentUser?.email
    });
    return;
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_BANS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(userId)) {
      list.push(userId);
      localStorage.setItem(MOCK_STORAGE_KEY_BANS, JSON.stringify(list));
    }
  } catch {}
};

export const isUserBanned = async (userId: string): Promise<boolean> => {
  if (isLiveFirebase() && db) {
    try {
      const snap = await getDoc(doc(db, 'banned_users', userId));
      return snap.exists();
    } catch {
      return false;
    }
  }

  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_BANS);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(userId);
  } catch {
    return false;
  }
};

// --- FILE UPLOADS WITH PROGRESS ---
export const uploadFile = async (
  folder: 'profiles' | 'apps',
  entityId: string,
  subFolder: 'images' | 'apk' | 'avatar',
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  if (isLiveFirebase() && storage) {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `${folder}/${entityId}/${subFolder}/${cleanFileName}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error("Storage upload failed:", error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  }

  // Realistic mock upload simulation
  return new Promise((resolve) => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 20 + 15);
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        if (onProgress) onProgress(100);

        // If it's an image, create a data URL for instant viewing
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve((e.target?.result as string) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80");
          };
          reader.readAsDataURL(file);
        } else {
          // APK fallback link
          resolve("https://github.com/octocat/Hello-World/raw/master/app-release.apk");
        }
      } else {
        if (onProgress) onProgress(current);
      }
    }, 150);
  });
};
