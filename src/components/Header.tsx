import React from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Globe, 
  HelpCircle, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    language, 
    setLanguage, 
    navigateTo, 
    currentUser, 
    isAdmin, 
    setAuthModalOpen, 
    setAuthModalTab,
    setGuideModalOpen,
    searchQuery,
    setSearchQuery,
    currentView,
    isLive
  } = useApp();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('search', { query: searchQuery.trim() });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 p-1.5 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor" fillOpacity="0.8" />
              <circle cx="17" cy="6" r="2" fill="white" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 dark:text-white">
                Droid<span className="text-emerald-600 dark:text-emerald-400">Store</span>
              </span>
              <span className="hidden xs:inline-flex px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                APK
              </span>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block font-medium">
              Android Market
            </span>
          </div>
        </div>

        {/* Search input (Hidden on small mobile, accessible via bottom nav) */}
        <form 
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-2 relative items-center"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'ऐप्स और गेम्स खोजें...' : 'Search apps, games, tools...'}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-full pl-10 pr-4 py-2 border border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-hidden transition"
            />
          </div>
        </form>

        {/* Right action controls */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Live vs Preview status pill */}
          <button
            onClick={() => setGuideModalOpen(true)}
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
              isLive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }`}
            title="Click to view Firebase Setup Guide"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isLive ? 'Firebase Live' : 'Firebase Guide'}</span>
          </button>

          {/* PWA Install */}
          <PWAInstallButton />

          {/* Guide Modal button for mobile/tablet */}
          <button
            onClick={() => setGuideModalOpen(true)}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition lg:hidden"
            title="Setup Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Language Toggle (EN / HI) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile / Login */}
          {currentUser ? (
            <div 
              onClick={() => navigateTo('profile')}
              className="flex items-center gap-2 pl-1 cursor-pointer select-none group"
            >
              <div className="relative">
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.uid}`}
                  alt="Profile"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-emerald-500/50 group-hover:ring-emerald-500 transition"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=user`;
                  }}
                />
                {isAdmin && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center" title="Admin">
                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalTab('signin');
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'लॉग इन' : 'Sign in'}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
