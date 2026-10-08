import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AppItem, 
  Language, 
  ViewType, 
  UserPublicProfile, 
  UserPrivateData 
} from '../types';
import { ADMIN_EMAILS } from '../config.js';
import { translations } from '../locales/translations';
import { 
  subscribeToAuth, 
  logOut as fbLogOut, 
  getUserPublicProfile, 
  isLiveFirebase, 
  isUserBanned 
} from '../services/firebase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  
  // Navigation
  currentView: ViewType;
  navigateTo: (view: ViewType, options?: { appId?: string; devId?: string; category?: string; query?: string }) => void;
  selectedAppId: string | null;
  selectedDeveloperId: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  
  // User & Auth
  currentUser: any | null;
  userProfile: UserPublicProfile | null;
  refreshUserProfile: () => Promise<void>;
  isAdmin: boolean;
  isBanned: boolean;
  authLoading: boolean;
  logout: () => Promise<void>;
  
  // Modals & Popups
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'signin' | 'signup';
  setAuthModalTab: (tab: 'signin' | 'signup') => void;
  guideModalOpen: boolean;
  setGuideModalOpen: (open: boolean) => void;
  legalModal: 'terms' | 'privacy' | 'dmca' | null;
  setLegalModal: (type: 'terms' | 'privacy' | 'dmca' | null) => void;
  
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Live vs Mock
  isLive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('droidstore_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('droidstore_lang') as Language;
    return saved === 'hi' ? 'hi' : 'en';
  });

  // Navigation
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // User state
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserPublicProfile | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | 'dmca' | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isLive = isLiveFirebase();

  // Apply dark mode class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('droidstore_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('droidstore_lang', lang);
  };

  const t = translations[language];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync Hash routing for GitHub Pages
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('app/')) {
        const appId = hash.replace('app/', '');
        setSelectedAppId(appId);
        setCurrentView('app-detail');
      } else if (hash.startsWith('dev/')) {
        const devId = hash.replace('dev/', '');
        setSelectedDeveloperId(devId);
        setCurrentView('developer');
      } else if (hash === 'search') {
        setCurrentView('search');
      } else if (hash === 'upload') {
        setCurrentView('upload');
      } else if (hash === 'my-apps') {
        setCurrentView('my-apps');
      } else if (hash === 'profile') {
        setCurrentView('profile');
      } else if (hash === 'admin') {
        setCurrentView('admin');
      } else if (hash === 'terms') {
        setCurrentView('terms');
      } else if (hash === 'privacy') {
        setCurrentView('privacy');
      } else if (hash === 'dmca') {
        setCurrentView('dmca');
      } else {
        setCurrentView('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: ViewType, options?: { appId?: string; devId?: string; category?: string; query?: string }) => {
    if (options?.appId) {
      setSelectedAppId(options.appId);
      window.location.hash = `app/${options.appId}`;
    } else if (options?.devId) {
      setSelectedDeveloperId(options.devId);
      window.location.hash = `dev/${options.devId}`;
    } else {
      window.location.hash = view === 'home' ? '' : view;
    }

    if (options?.category !== undefined) {
      setSelectedCategory(options.category);
    }
    if (options?.query !== undefined) {
      setSearchQuery(options.query);
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth subscription
  useEffect(() => {
    const unsub = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        const banned = await isUserBanned(user.uid);
        setIsBanned(banned);
        const profile = await getUserPublicProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
        setIsBanned(false);
      }
      setAuthLoading(false);
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const refreshUserProfile = async () => {
    if (currentUser) {
      const p = await getUserPublicProfile(currentUser.uid);
      setUserProfile(p);
    }
  };

  const logout = async () => {
    await fbLogOut();
    setCurrentUser(null);
    setUserProfile(null);
    showToast(language === 'hi' ? 'लॉग आउट किया गया।' : 'Logged out successfully.', 'info');
    navigateTo('home');
  };

  // Admin check: email must match ADMIN_EMAILS
  const userEmail = currentUser?.email?.toLowerCase();
  const isAdmin = Boolean(
    userEmail && ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === userEmail)
  );

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
        currentView,
        navigateTo,
        selectedAppId,
        selectedDeveloperId,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        currentUser,
        userProfile,
        refreshUserProfile,
        isAdmin,
        isBanned,
        authLoading,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        guideModalOpen,
        setGuideModalOpen,
        legalModal,
        setLegalModal,
        toasts,
        showToast,
        removeToast,
        isLive
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
