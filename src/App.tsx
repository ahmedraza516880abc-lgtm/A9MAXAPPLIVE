/**
 * DroidStore - Android APK & Games Store
 * Mobile-first PWA, GitHub Pages compatible, Firebase backend
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { ToastContainer } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { LegalModals } from './components/LegalModals';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';

import { HomeView } from './views/HomeView';
import { AppDetailView } from './views/AppDetailView';
import { SearchView } from './views/SearchView';
import { UploadView } from './views/UploadView';
import { ProfileView } from './views/ProfileView';
import { PublicDeveloperView } from './views/PublicDeveloperView';
import { AdminPanelView } from './views/AdminPanelView';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {currentView === 'home' && <HomeView />}
      {currentView === 'search' && <SearchView />}
      {currentView === 'upload' && <UploadView />}
      {currentView === 'my-apps' && <ProfileView />}
      {currentView === 'profile' && <ProfileView />}
      {currentView === 'app-detail' && <AppDetailView />}
      {currentView === 'developer' && <PublicDeveloperView />}
      {currentView === 'admin' && <AdminPanelView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans antialiased transition-colors duration-200">
        <Header />
        <MainContent />
        <BottomNavigation />
        
        {/* Global Modals & Overlays */}
        <ToastContainer />
        <AuthModal />
        <LegalModals />
        <FirebaseGuideModal />
      </div>
    </AppProvider>
  );
}
