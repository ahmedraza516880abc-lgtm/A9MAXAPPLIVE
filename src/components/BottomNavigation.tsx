import React from 'react';
import { Home, Search, UploadCloud, Layers, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavigation: React.FC = () => {
  const { currentView, navigateTo, language, currentUser, setAuthModalOpen } = useApp();

  const navItems = [
    {
      id: 'home' as const,
      label: language === 'hi' ? 'होम' : 'Home',
      icon: Home
    },
    {
      id: 'search' as const,
      label: language === 'hi' ? 'खोजें' : 'Search',
      icon: Search
    },
    {
      id: 'upload' as const,
      label: language === 'hi' ? 'अपलोड' : 'Upload',
      icon: UploadCloud,
      highlight: true
    },
    {
      id: 'my-apps' as const,
      label: language === 'hi' ? 'मेरे ऐप्स' : 'My Apps',
      icon: Layers
    },
    {
      id: 'profile' as const,
      label: language === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
      icon: User
    }
  ];

  const handleNavClick = (viewId: typeof navItems[number]['id']) => {
    if ((viewId === 'upload' || viewId === 'my-apps') && !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    navigateTo(viewId);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)] transition-colors">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="flex flex-col items-center justify-center h-full relative group transition-all select-none"
            >
              {/* Highlight pill for active item */}
              <div
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 scale-105'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
