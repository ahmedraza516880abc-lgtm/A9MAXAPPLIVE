import React, { useEffect, useState } from 'react';
import { ArrowLeft, Globe, ExternalLink, DownloadCloud, Star, Layers, ShieldCheck } from 'lucide-react';
import { UserPublicProfile, AppItem } from '../types';
import { getUserPublicProfile, getApprovedApps } from '../services/firebase';
import { AppCard } from '../components/AppCard';
import { formatDownloads } from '../components/AppCard';
import { useApp } from '../context/AppContext';

export const PublicDeveloperView: React.FC = () => {
  const { selectedDeveloperId, navigateTo, language } = useApp();
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [devApps, setDevApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDeveloperId) return;

    const loadDevData = async () => {
      try {
        setLoading(true);
        const p = await getUserPublicProfile(selectedDeveloperId);
        setProfile(p);

        const allApproved = await getApprovedApps();
        const filtered = allApproved.filter(a => a.uploaderId === selectedDeveloperId);
        setDevApps(filtered);
      } catch (err) {
        console.error("Error loading developer page:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDevData();
  }, [selectedDeveloperId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-52 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const totalDownloads = devApps.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 -ml-2 rounded-xl transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === 'hi' ? 'वापस जाएं' : 'Back to Store'}</span>
      </button>

      {/* Developer Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={profile?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedDeveloperId}`}
              alt="Developer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-md shrink-0 bg-gray-100 dark:bg-gray-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                  {profile?.displayName || 'Android Developer'}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-lg mt-1 line-clamp-3">
                {profile?.bio || 'Independent Android software developer creating applications and games.'}
              </p>

              {/* Website / Social Link - Notice: developer email is never shown publicly */}
              {profile?.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-2 font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{profile.website}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Developer stats */}
        <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {devApps.length}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              Published Apps
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1">
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              {formatDownloads(totalDownloads)}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              Total Downloads
            </span>
          </div>
        </div>
      </div>

      {/* Published apps */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <span>Published by {profile?.displayName || 'Developer'}</span>
        </h2>

        {devApps.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 text-sm">
            No public applications published yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {devApps.map(app => (
              <AppCard key={app.id} app={app} layout="grid" />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
