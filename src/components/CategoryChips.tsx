import React from 'react';
import { 
  Gamepad2, 
  Smartphone, 
  Wrench, 
  GraduationCap, 
  MessageCircle, 
  Tv, 
  Sparkles 
} from 'lucide-react';
import { AppCategory } from '../types';
import { APP_CATEGORIES } from '../config.js';
import { useApp } from '../context/AppContext';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Games: Gamepad2,
  Apps: Smartphone,
  Tools: Wrench,
  Education: GraduationCap,
  Social: MessageCircle,
  Entertainment: Tv
};

export const CategoryChips: React.FC = () => {
  const { selectedCategory, setSelectedCategory, language, t } = useApp();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 my-1">
      <div className="flex items-center gap-2 min-w-max px-0.5">
        {/* All apps chip */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none ${
            selectedCategory === null
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'सभी ऐप्स' : 'For You'}</span>
        </button>

        {APP_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] || Smartphone;
          const isSelected = selectedCategory === cat;
          const label = t.categories[cat as AppCategory] || cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isSelected ? null : cat)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
