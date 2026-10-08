import React, { useEffect, useState } from 'react';
import { 
  Camera, 
  Edit3, 
  Globe, 
  Trash2, 
  Upload, 
  ShieldCheck, 
  Star, 
  DownloadCloud, 
  Layers, 
  Settings, 
  LogOut, 
  Check, 
  AlertTriangle, 
  X,
  Plus,
  Key,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AppItem, ReviewItem } from '../types';
import { 
  getUserApps, 
  deleteApp, 
  updateAppDetails, 
  uploadFile, 
  updateUserPublicProfile, 
  deleteUserAccount,
  getApprovedApps,
  getAppReviews,
  deleteAppReview,
  resetPassword
} from '../services/firebase';
import { MAX_PROFILE_IMAGE_BYTES, MAX_APK_SIZE_BYTES } from '../config.js';
import { formatDownloads, formatSize } from '../components/AppCard';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    userProfile, 
    refreshUserProfile, 
    isAdmin, 
    logout, 
    navigateTo, 
    setAuthModalOpen, 
    theme, 
    toggleTheme, 
    language, 
    setLanguage, 
    t, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'apps' | 'reviews' | 'settings'>('apps');
  const [appStatusTab, setAppStatusTab] = useState<'approved' | 'pending' | 'rejected'>('approved');

  const [userApps, setUserApps] = useState<AppItem[]>([]);
  const [userReviews, setUserReviews] = useState<{ app: AppItem; review: ReviewItem }[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Edit Profile Modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar Upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit App Modal
  const [editAppModalOpen, setEditAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [editAppVersion, setEditAppVersion] = useState('');
  const [editAppWhatsNew, setEditAppWhatsNew] = useState('');
  const [newApkFile, setNewApkFile] = useState<File | null>(null);
  const [savingAppEdit, setSavingAppEdit] = useState(false);

  // Delete App Modal
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const [deletingApp, setDeletingApp] = useState(false);

  // Delete Account Modal
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

  // Notifications State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load User Apps and Reviews
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        setLoadingApps(true);
        const apps = await getUserApps(currentUser.uid);
        setUserApps(apps);

        // Find reviews written by this user across approved apps
        const allApps = await getApprovedApps();
        const collectedReviews: { app: AppItem; review: ReviewItem }[] = [];
        for (const a of allApps) {
          const revs = await getAppReviews(a.id);
          const mine = revs.find(r => r.userId === currentUser.uid);
          if (mine) {
            collectedReviews.push({ app: a, review: mine });
          }
        }
        setUserReviews(collectedReviews);
      } catch (err) {
        console.error("Error loading user apps/reviews:", err);
      } finally {
        setLoadingApps(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Set Profile form initials
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.displayName || '');
      setEditBio(userProfile.bio || '');
      setEditWebsite(userProfile.website || '');
    } else if (currentUser) {
      setEditName(currentUser.displayName || '');
    }
  }, [userProfile, currentUser]);

  // Guard: If not logged in, show login prompt screen
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
          <Settings className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t.loginPrompt}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          {t.loginSubtitle}
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20"
        >
          {t.signIn}
        </button>
      </div>
    );
  }

  // Developer Stats
  const totalAppsCount = userApps.length;
  const totalDownloads = userApps.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
  const avgRating = totalAppsCount > 0
    ? (userApps.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalAppsCount).toFixed(1)
    : '5.0';

  // Filter My Apps by status tab
  const displayedApps = userApps.filter(a => a.status === appStatusTab);

  // Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file.', 'error');
        return;
      }
      if (file.size > MAX_PROFILE_IMAGE_BYTES) {
        showToast('Profile photo must be less than 2 MB.', 'error');
        return;
      }

      try {
        setUploadingAvatar(true);
        const photoURL = await uploadFile('profiles', currentUser.uid, 'avatar', file);
        await updateUserPublicProfile(currentUser.uid, { photoURL });
        await refreshUserProfile();
        showToast(language === 'hi' ? 'प्रोफ़ाइल फ़ोटो अपडेट की गई!' : 'Profile photo updated!');
      } catch (err: any) {
        showToast(err.message || 'Failed to upload photo', 'error');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  // Save Edit Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateUserPublicProfile(currentUser.uid, {
        displayName: editName.trim(),
        bio: editBio.trim(),
        website: editWebsite.trim()
      });
      await refreshUserProfile();
      setEditProfileOpen(false);
      showToast(language === 'hi' ? 'प्रोफ़ाइल सेव हो गई!' : 'Profile saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Error saving profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Open Edit App Modal
  const openEditApp = (app: AppItem) => {
    setEditingApp(app);
    setEditAppVersion(app.version);
    setEditAppWhatsNew(app.whatsNew || '');
    setNewApkFile(null);
    setEditAppModalOpen(true);
  };

  // Save App Edit (new APK or version)
  const handleSaveAppEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      setSavingAppEdit(true);
      let apkUrl = editingApp.apkUrl;
      let apkSize = editingApp.apkSize;

      if (newApkFile) {
        if (!newApkFile.name.toLowerCase().endsWith('.apk')) {
          showToast('File must be an .apk package', 'error');
          setSavingAppEdit(false);
          return;
        }
        if (newApkFile.size > MAX_APK_SIZE_BYTES) {
          showToast('APK size must not exceed 100 MB', 'error');
          setSavingAppEdit(false);
          return;
        }
        apkUrl = await uploadFile('apps', editingApp.id, 'apk', newApkFile);
        apkSize = newApkFile.size;
      }

      await updateAppDetails(editingApp.id, {
        version: editAppVersion.trim(),
        whatsNew: editAppWhatsNew.trim(),
        apkUrl,
        apkSize,
        // When new version uploaded, reset status to pending for review
        status: newApkFile ? 'pending' : editingApp.status
      });

      // Reload apps
      const apps = await getUserApps(currentUser.uid);
      setUserApps(apps);
      setEditAppModalOpen(false);
      showToast(newApkFile 
        ? (language === 'hi' ? 'नया APK सबमिट हुआ! एडमिन रिव्यू के बाद अपडेट होगा।' : 'New APK uploaded! Pending review.') 
        : (language === 'hi' ? 'ऐप डिटेल्स अपडेट हुईं!' : 'App details updated!'));
    } catch (err: any) {
      showToast(err.message || 'Error updating app', 'error');
    } finally {
      setSavingAppEdit(false);
    }
  };

  // Delete App Handler
  const handleDeleteApp = async () => {
    if (!deleteAppId) return;
    try {
      setDeletingApp(true);
      await deleteApp(deleteAppId);
      setUserApps(prev => prev.filter(a => a.id !== deleteAppId));
      setDeleteAppId(null);
      showToast(language === 'hi' ? 'ऐप हटा दिया गया।' : 'App deleted successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete app', 'error');
    } finally {
      setDeletingApp(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (appId: string) => {
    try {
      await deleteAppReview(appId, currentUser.uid);
      setUserReviews(prev => prev.filter(r => r.app.id !== appId));
      showToast(language === 'hi' ? 'समीक्षा हटा दी गई।' : 'Review deleted.');
    } catch (err: any) {
      showToast(err.message || 'Error deleting review', 'error');
    }
  };

  // Delete User Account
  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount(currentUser.uid);
      showToast(language === 'hi' ? 'आपका खाता हटा दिया गया।' : 'Account permanently deleted.');
      navigateTo('home');
    } catch (err: any) {
      showToast(err.message || 'Error deleting account', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12 space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        
        {/* Admin Badge Banner if user is admin */}
        {isAdmin && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Store Administrator</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Big round profile photo (clickable to change, max 2MB) */}
            <div className="relative group shrink-0">
              <img
                src={userProfile?.photoURL || currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.uid}`}
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-emerald-500/30 group-hover:ring-emerald-500 transition shadow-md"
              />
              <label 
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white"
                title="Change Photo (Max 2MB)"
              >
                <Camera className="w-6 h-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                  ...
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                  {userProfile?.displayName || currentUser.displayName || 'Android Developer'}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Dev
                </span>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md line-clamp-2">
                {userProfile?.bio || 'Android enthusiast & independent software creator.'}
              </p>

              {/* Website / Social Link */}
              {userProfile?.website && (
                <a
                  href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline pt-0.5"
                >
                  <Globe className="w-3 h-3" />
                  <span>{userProfile.website}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}

              <p className="text-[11px] text-gray-400 pt-1">
                {t.memberSince}: {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => setEditProfileOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t.editProfile}</span>
            </button>

            {/* Public Developer Page button */}
            <button
              onClick={() => navigateTo('developer', { devId: currentUser.uid })}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-semibold transition"
            >
              <span>Public Dev Page</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Admin Panel button if user is in ADMIN_EMAILS */}
            {isAdmin && (
              <button
                onClick={() => navigateTo('admin')}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.adminPanel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {totalAppsCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t.appsUploaded}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1">
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              {formatDownloads(totalDownloads)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t.totalAppDownloads}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {avgRating}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t.avgRating}
            </span>
          </div>
        </div>

      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-6">
        <button
          onClick={() => setActiveTab('apps')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'apps'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t.myApps} ({userApps.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t.reviews} ({userReviews.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {t.settings}
        </button>
      </div>

      {/* TAB 1: MY APPS */}
      {activeTab === 'apps' && (
        <div className="space-y-4">
          
          {/* Sub tabs: Published / Pending / Rejected */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 max-w-sm">
            <button
              onClick={() => setAppStatusTab('approved')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                appStatusTab === 'approved'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t.publishedTab} ({userApps.filter(a => a.status === 'approved').length})
            </button>

            <button
              onClick={() => setAppStatusTab('pending')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                appStatusTab === 'pending'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t.pendingTab} ({userApps.filter(a => a.status === 'pending').length})
            </button>

            <button
              onClick={() => setAppStatusTab('rejected')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                appStatusTab === 'rejected'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t.rejectedTab} ({userApps.filter(a => a.status === 'rejected').length})
            </button>
          </div>

          {/* List of Apps */}
          {displayedApps.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {language === 'hi' ? 'इस श्रेणी में कोई ऐप नहीं है।' : 'No applications found in this tab.'}
              </p>
              <button
                onClick={() => navigateTo('upload')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New App</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedApps.map(app => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 bg-gray-100 dark:bg-gray-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 
                          onClick={() => navigateTo('app-detail', { appId: app.id })}
                          className="font-bold text-gray-900 dark:text-white text-sm hover:text-emerald-600 cursor-pointer"
                        >
                          {app.name}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono">v{app.version}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{app.category}</span>
                        <span>•</span>
                        <span>{formatSize(app.apkSize)}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatDownloads(app.downloads)} downloads
                        </span>
                      </div>

                      {/* Rejection reason box if rejected */}
                      {app.status === 'rejected' && app.rejectionReason && (
                        <div className="mt-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 text-xs border border-rose-200 dark:border-rose-900">
                          <strong>{t.rejectionReason}:</strong> {app.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => openEditApp(app)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t.editApp}</span>
                    </button>

                    <button
                      onClick={() => setDeleteAppId(app.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                      title={t.deleteApp}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MY REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {userReviews.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 text-sm">
              You haven't written any reviews yet.
            </div>
          ) : (
            userReviews.map(({ app, review }) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      onClick={() => navigateTo('app-detail', { appId: app.id })}
                      className="font-bold text-sm text-gray-900 dark:text-white hover:text-emerald-600 cursor-pointer"
                    >
                      {app.name}
                    </span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star
                          key={st}
                          className={`w-3 h-3 ${st <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    "{review.comment}"
                  </p>
                  <span className="text-[10px] text-gray-400 block">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteReview(app.id)}
                  className="self-end sm:self-center p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.deleteReview}</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 space-y-6">
          
          {/* Dark mode setting */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t.darkMode}</h3>
              <p className="text-xs text-gray-400">Adjust high-contrast theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-emerald-600' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Language setting */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t.language}</h3>
              <p className="text-xs text-gray-400">English / हिन्दी</p>
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${language === 'en' ? 'bg-white dark:bg-gray-900 text-emerald-600 shadow-xs' : 'text-gray-500'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${language === 'hi' ? 'bg-white dark:bg-gray-900 text-emerald-600 shadow-xs' : 'text-gray-500'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Notifications toggle */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t.notifications}</h3>
              <p className="text-xs text-gray-400">Receive upload approval updates</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-emerald-600' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Password Reset */}
          {currentUser.email && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t.changePassword}</h3>
                <p className="text-xs text-gray-400">Send password reset email to {currentUser.email}</p>
              </div>
              <button
                onClick={async () => {
                  await resetPassword(currentUser.email);
                  showToast(t.resetEmailSent);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Send Link
              </button>
            </div>
          )}

          {/* Logout */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={logout}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>

            <button
              onClick={() => setDeleteAccountModalOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.deleteAccount}</span>
            </button>
          </div>

        </div>
      )}

      {/* MODAL: Edit Profile */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              {t.editProfile}
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t.displayName}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t.bio}
                  </label>
                  <span className="text-[10px] text-gray-400">{editBio.length}/150</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a short summary of your projects or studio..."
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t.websiteLink}
                </label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://yourdomain.com or @handle"
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  {savingProfile ? 'Saving...' : t.saveProfile}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit App (New Version / APK upload) */}
      {editAppModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              {t.editApp}: {editingApp.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Update version notes or upload an updated APK package file.
            </p>

            <form onSubmit={handleSaveAppEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t.versionLabel}
                </label>
                <input
                  type="text"
                  required
                  value={editAppVersion}
                  onChange={(e) => setEditAppVersion(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t.whatsNewLabel}
                </label>
                <textarea
                  rows={3}
                  value={editAppWhatsNew}
                  onChange={(e) => setEditAppWhatsNew(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Upload New APK File (Optional - replaces existing v{editingApp.version})
                </label>
                <input
                  type="file"
                  accept=".apk"
                  onChange={(e) => e.target.files && setNewApkFile(e.target.files[0])}
                  className="w-full p-2 text-xs border border-dashed rounded-xl border-gray-300 dark:border-gray-700"
                />
                {newApkFile && (
                  <span className="text-[11px] text-emerald-600 block mt-1">
                    Selected: {newApkFile.name} ({(newApkFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditAppModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAppEdit}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  {savingAppEdit ? 'Saving...' : 'Update Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION: Delete App */}
      {deleteAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              {t.deleteApp}
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              {t.confirmDeleteApp}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteAppId(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApp}
                disabled={deletingApp}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                {deletingApp ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION: Delete Account */}
      {deleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              {t.deleteAccount}
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              {t.confirmDeleteAccount}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteAccountModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
