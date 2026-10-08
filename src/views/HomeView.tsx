import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Clock, Award, DownloadCloud, ChevronRight, Layers } from 'lucide-react';
import { AppItem, AppCategory } from '../types';
import { getApprovedApps } from '../services/firebase';
import { BannerSlider } from '../components/BannerSlider';
import { CategoryChips } from '../components/CategoryChips';
import { AppCard } from '../components/AppCard';
import { useApp } from '../context/AppContext';

export const HomeView: React.FC = () => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCategory, language, t, navigateTo, setLegalModal } = useApp();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getApprovedApps();
        setApps(data);
      } catch (err) {
        console.error("Error loading approved apps:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter apps by category if selected
  const filteredApps = selectedCategory
    ? apps.filter(a => a.category === selectedCategory)
    : apps;

  const trendingGames = apps.filter(a => a.category === 'Games').slice(0, 4);
  const newReleases = [...apps].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const topRated = [...apps].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const mostDownloaded = [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 6);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-full max-w-md" />
        <div className="h-64 sm:h-80 bg-gray-200 dark:bg-gray-800 rounded-3xl w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-56 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12 space-y-7">
      
      {/* Category selector */}
      <CategoryChips />

      {/* When a specific category is selected, show that category's view */}
      {selectedCategory ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>{t.categories[selectedCategory as AppCategory] || selectedCategory}</span>
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredApps.length} {language === 'hi' ? 'ऐप्स उपलब्ध' : 'apps available'}
            </span>
          </div>

          {filteredApps.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {language === 'hi' ? 'इस श्रेणी में अभी कोई ऐप उपलब्ध नहीं है।' : 'No apps currently found in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {filteredApps.map(app => (
                <AppCard key={app.id} app={app} layout="grid" />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Featured carousel */}
          <BannerSlider apps={apps} />

          {/* Section: Trending Games */}
          {trendingGames.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {t.trending}
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === 'hi' ? 'प्लेयर्स द्वारा सबसे ज्यादा खेले जाने वाले गेम्स' : 'High engagement & trending titles'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigateTo('search', { category: 'Games' })}
                  className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>{t.viewAll}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {trendingGames.map(app => (
                  <AppCard key={app.id} app={app} layout="grid" />
                ))}
              </div>
            </section>
          )}

          {/* Section: Most Downloaded (Horizontal layout showcase) */}
          {mostDownloaded.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <DownloadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {t.mostDownloaded}
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === 'hi' ? 'दुनिया भर में लाखों बार डाउनलोड' : 'Top downloaded Android packages'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {mostDownloaded.map(app => (
                  <AppCard key={app.id} app={app} layout="horizontal" />
                ))}
              </div>
            </section>
          )}

          {/* Section: New & Updated */}
          {newReleases.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {t.newReleases}
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === 'hi' ? 'ताज़ा जोड़े गए और अपडेटेड ऐप्स' : 'Recently published community APKs'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigateTo('search')}
                  className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>{t.viewAll}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {newReleases.map(app => (
                  <AppCard key={app.id} app={app} layout="grid" />
                ))}
              </div>
            </section>
          )}

          {/* Section: Top Rated */}
          {topRated.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {t.topRated}
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {language === 'hi' ? 'यूज़र्स द्वारा उच्चतम रेटेड ऐप्स (4.5★+)' : 'Highest community rated software'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {topRated.map(app => (
                  <AppCard key={app.id} app={app} layout="grid" />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Footer / Legal links */}
      <footer className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center space-y-3">
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
          <button onClick={() => setLegalModal('terms')} className="hover:text-emerald-600 transition">
            {t.terms}
          </button>
          <span>•</span>
          <button onClick={() => setLegalModal('privacy')} className="hover:text-emerald-600 transition">
            {t.privacy}
          </button>
          <span>•</span>
          <button onClick={() => setLegalModal('dmca')} className="hover:text-emerald-600 transition">
            {t.dmca}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          DroidStore © {new Date().getFullYear()} — Mobile-first Android APK Marketplace. Not affiliated with Google LLC.
        </p>
      </footer>

    </div>
  );
};
