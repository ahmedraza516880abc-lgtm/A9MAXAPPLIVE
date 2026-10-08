export type AppCategory = 
  | 'Games' 
  | 'Apps' 
  | 'Tools' 
  | 'Education' 
  | 'Social' 
  | 'Entertainment';

export type AppStatus = 'pending' | 'approved' | 'rejected';

export interface AppItem {
  id: string;
  name: string;
  category: AppCategory;
  shortDescription: string;
  fullDescription: string;
  version: string;
  packageName: string;
  iconUrl: string;
  screenshots: string[];
  apkUrl: string;
  apkSize: number; // in bytes
  downloads: number;
  rating: number; // 0 to 5
  reviewCount: number;
  uploaderId: string;
  uploaderName: string;
  status: AppStatus;
  rejectionReason?: string;
  whatsNew?: string;
  minAndroidVersion?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  featured?: boolean;
}

export interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: number;
  updatedAt?: number;
}

export interface UserPublicProfile {
  uid: string;
  displayName: string;
  bio?: string;
  website?: string;
  photoURL?: string;
  createdAt: number;
  isDeveloper?: boolean;
}

export interface UserPrivateData {
  uid: string;
  email: string;
  notificationEnabled?: boolean;
  theme?: 'light' | 'dark';
  language?: 'en' | 'hi';
  createdAt: number;
}

export interface ReportItem {
  id: string;
  appId: string;
  appName: string;
  reporterId: string;
  reporterEmail?: string;
  reason: 'malware' | 'dmca' | 'inappropriate' | 'broken' | 'spam' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: number;
}

export type ViewType = 
  | 'home' 
  | 'search' 
  | 'upload' 
  | 'my-apps' 
  | 'profile' 
  | 'app-detail' 
  | 'developer' 
  | 'admin'
  | 'terms'
  | 'privacy'
  | 'dmca';

export type Language = 'en' | 'hi';
