import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, Filter, ArrowUpDown, Layers } from 'lucide-react';
import { AppItem, AppCategory } from '../types';
import { getApprovedApps } from '../services/firebase';
import { AppCard } from '../components/AppCard';
import { CategoryChips } from '../components/CategoryChips';
import { useApp } from '../context/AppContext';
import { APP_CATEGORIES } from '../config.js';

export const SearchView: React.FC = () => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'newest' | 'name'>('downloads');

  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, language, t } = useApp();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = await getApprovedApps();
        setApps(data);
      } catch (err) {
        console.error("Error fetching apps for search:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const searchResults = useMemo(() => {
    let result = apps.filter(app => {
      const matchesQuery = 
        !searchQuery.trim() ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.packageName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || app.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [apps, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12 space-y-5">
      
      {/* Search Input Bar */}
      <div className="relative w-full max-w-2xl mx-auto">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          autoFocus
          className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:outline-hidden transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category selector */}
      <CategoryChips />

      {/* Filter and Sort row */}
      <div className="flex items-center justify-between gap-4 pt-1 pb-2">
        <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
          {searchResults.length} {language === 'hi' ? 'ऐप्स मिले' : 'results found'}
        </span>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="p-1.5 px-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-hidden cursor-pointer"
          >
            <option value="downloads">{language === 'hi' ? 'सबसे ज्यादा डाउनलोड' : 'Most Downloaded'}</option>
            <option value="rating">{language === 'hi' ? 'उच्चतम रेटिंग' : 'Top Rated'}</option>
            <option value="newest">{language === 'hi' ? 'नवीनतम (Newest)' : 'Newest Releases'}</option>
            <option value="name">{language === 'hi' ? 'नाम (A-Z)' : 'Name (A-Z)'}</option>
          </select>
        </div>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      ) : searchResults.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t.noAppsFound}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {searchResults.map(app => (
            <AppCard key={app.id} app={app} layout="grid" />
          ))}
        </div>
      )}

    </div>
  );
};
