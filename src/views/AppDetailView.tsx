import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Star, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  HardDrive, 
  Layers, 
  Flag, 
  Trash2, 
  Edit3, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppItem, ReviewItem } from '../types';
import { 
  getAppById, 
  getApprovedApps, 
  getAppReviews, 
  addOrUpdateAppReview, 
  deleteAppReview, 
  recordDownload,
  submitReport 
} from '../services/firebase';
import { useApp } from '../context/AppContext';
import { formatDownloads, formatSize, AppCard } from '../components/AppCard';

export const AppDetailView: React.FC = () => {
  const { 
    selectedAppId, 
    navigateTo, 
    currentUser, 
    setAuthModalOpen, 
    language, 
    t, 
    showToast 
  } = useApp();

  const [app, setApp] = useState<AppItem | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [similarApps, setSimilarApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Active screenshot preview modal
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Review state
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<'malware' | 'dmca' | 'inappropriate' | 'broken' | 'spam' | 'other'>('malware');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    if (!selectedAppId) return;

    const loadAppDetails = async () => {
      try {
        setLoading(true);
        const data = await getAppById(selectedAppId);
        setApp(data);

        if (data) {
          const revs = await getAppReviews(data.id);
          setReviews(revs);

          // Check if current user already reviewed
          if (currentUser) {
            const myRev = revs.find(r => r.userId === currentUser.uid);
            if (myRev) {
              setUserRating(myRev.rating);
              setUserComment(myRev.comment);
            }
          }

          // Fetch similar apps
          const all = await getApprovedApps();
          const similar = all.filter(a => a.id !== data.id && a.category === data.category).slice(0, 4);
          setSimilarApps(similar.length > 0 ? similar : all.filter(a => a.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading app detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAppDetails();
  }, [selectedAppId, currentUser]);

  if (loading || !app) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-1/4" />
          </div>
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full" />
      </div>
    );
  }

  const existingUserReview = currentUser ? reviews.find(r => r.userId === currentUser.uid) : null;

  // Handle Download APK
  const handleDownload = async () => {
    try {
      setDownloading(true);
      // Increment counter in Firestore
      const newDownloads = await recordDownload(app.id);
      setApp(prev => prev ? { ...prev, downloads: newDownloads } : null);

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      showToast(language === 'hi' ? 'APK डाउनलोड शुरू हो रहा है...' : 'Starting APK download...', 'success');

      // Create download trigger
      const link = document.createElement('a');
      link.href = app.apkUrl;
      link.download = `${app.packageName || app.name}.apk`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      showToast('Download error. Please retry.', 'error');
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  // Handle Share
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: app.name,
          text: `Download ${app.name} APK on DroidStore:`,
          url: shareUrl
        });
        return;
      } catch {}
    }

    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    showToast(t.copiedLink);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Review Submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!userComment.trim()) {
      showToast('Please write a short review.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const newReview: ReviewItem = {
        id: currentUser.uid,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Android User',
        userPhoto: currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.uid}`,
        rating: userRating,
        comment: userComment.trim(),
        createdAt: existingUserReview ? existingUserReview.createdAt : Date.now(),
        updatedAt: Date.now()
      };

      await addOrUpdateAppReview(app.id, newReview);
      const updated = await getAppReviews(app.id);
      setReviews(updated);
      
      // Update local app rating
      const reloaded = await getAppById(app.id);
      if (reloaded) setApp(reloaded);

      setEditingReview(false);
      showToast(t.reviewSubmitted);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Review Delete
  const handleReviewDelete = async () => {
    if (!currentUser) return;
    try {
      await deleteAppReview(app.id, currentUser.uid);
      const updated = await getAppReviews(app.id);
      setReviews(updated);
      const reloaded = await getAppById(app.id);
      if (reloaded) setApp(reloaded);
      setUserComment('');
      setEditingReview(false);
      showToast(language === 'hi' ? 'समीक्षा हटा दी गई।' : 'Review deleted.');
    } catch (e: any) {
      showToast(e.message || 'Error deleting review', 'error');
    }
  };

  // Report Submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setSubmittingReport(true);
      await submitReport({
        appId: app.id,
        appName: app.name,
        reporterId: currentUser.uid,
        reporterEmail: currentUser.email || undefined,
        reason: reportReason,
        details: reportDetails.trim()
      });
      setReportModalOpen(false);
      setReportDetails('');
      showToast(language === 'hi' ? 'रिपोर्ट सबमिट की गई। एडमिन टीम इसकी समीक्षा करेगी।' : 'Report submitted for administrative review.');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12 space-y-6">
      
      {/* Top Back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 -ml-2 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'वापस जाएं' : 'Back to Store'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedShare ? (language === 'hi' ? 'कॉपी हुआ' : 'Copied') : t.shareApp}</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                setAuthModalOpen(true);
              } else {
                setReportModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.reportApp}</span>
          </button>
        </div>
      </div>

      {/* Main App Hero Details */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-md ring-1 ring-gray-100 dark:ring-gray-800 bg-gray-100 dark:bg-gray-800 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80`;
              }}
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {app.name}
              </h1>
              
              {/* Developer Link */}
              <div 
                onClick={() => navigateTo('developer', { devId: app.uploaderId })}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer mt-0.5"
              >
                <span>{app.uploaderName}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {app.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {t.playProtectVerified}
                </span>
              </div>
            </div>
          </div>

          {/* Big Green Download Button */}
          <div className="sm:self-center">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 active:scale-98 transition disabled:opacity-75"
            >
              <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? t.downloading : t.download}</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-4 border-y border-gray-100 dark:border-gray-800 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              <span>{app.rating.toFixed(1)}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {reviews.length} {t.reviews}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {formatDownloads(app.downloads)}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {t.downloadsCount}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {formatSize(app.apkSize)}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {t.size}
            </span>
          </div>

          <div className="hidden sm:flex flex-col items-center">
            <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              v{app.version}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {t.version}
            </span>
          </div>
        </div>

        {/* Trust Disclaimer Notice */}
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{t.installWarning}</span>
        </div>

      </div>

      {/* Screenshots Gallery */}
      {app.screenshots && app.screenshots.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {t.screenshots}
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {app.screenshots.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Screenshot ${idx + 1}`}
                onClick={() => setSelectedScreenshot(imgUrl)}
                className="h-56 sm:h-72 rounded-2xl object-cover shadow-sm cursor-pointer hover:opacity-95 transition hover:scale-101 border border-gray-100 dark:border-gray-800 shrink-0"
              />
            ))}
          </div>
        </section>
      )}

      {/* Description & What's New */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 border border-gray-100 dark:border-gray-800 space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            {t.aboutApp}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {app.fullDescription || app.shortDescription}
          </p>
        </div>

        {app.whatsNew && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t.whatsNew} (v{app.version})</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
              {app.whatsNew}
            </p>
          </div>
        )}

        {/* Technical Specification details */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block font-medium">Package</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200 truncate block mt-0.5" title={app.packageName}>
              {app.packageName}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">OS Required</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200 block mt-0.5">
              {app.minAndroidVersion || 'Android 8.0+'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Updated</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200 block mt-0.5">
              {new Date(app.updatedAt || app.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Content Rating</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200 block mt-0.5">
              Everyone
            </span>
          </div>
        </div>
      </div>

      {/* Ratings and Reviews Section */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 border border-gray-100 dark:border-gray-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t.reviews} & {t.rating}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Verified community feedback from actual users
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {app.rating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 ${star <= Math.round(app.rating) ? 'fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">
                {reviews.length} total reviews
              </span>
            </div>
          </div>
        </div>

        {/* Add / Edit Review Form */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
          {!currentUser ? (
            <div className="text-center py-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
                Sign in to rate and share your review for this app.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                {t.signIn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {existingUserReview ? t.editReview : t.writeReview}
                </span>

                {/* 1-5 Star Picker */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-115 transition"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= userRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                required
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your experience (performance, UI, bugs, gameplay)..."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              />

              <div className="flex items-center justify-between">
                {existingUserReview ? (
                  <button
                    type="button"
                    onClick={handleReviewDelete}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.deleteReview}</span>
                  </button>
                ) : <span />}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : t.submitReview}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Existing reviews list */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Be the first to review this application!
            </p>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.userPhoto || `https://api.dicebear.com/7.x/identicon/svg?seed=${rev.userId}`}
                      alt={rev.userName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        {rev.userName}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star
                        key={st}
                        className={`w-3 h-3 ${st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Similar Apps Section */}
      {similarApps.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {t.similarApps}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {similarApps.map(sim => (
              <AppCard key={sim.id} app={sim} layout="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Screenshot Modal Lightbox */}
      {selectedScreenshot && (
        <div 
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs cursor-pointer animate-in fade-in"
        >
          <img
            src={selectedScreenshot}
            alt="Enlarged screenshot"
            className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              {t.reportApp}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Help us keep the community safe.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e: any) => setReportReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden"
                >
                  <option value="malware">Malware / Spyware / Virus</option>
                  <option value="dmca">DMCA / Copyright Infringement</option>
                  <option value="inappropriate">Inappropriate / Harmful Content</option>
                  <option value="broken">Crashing / Broken APK</option>
                  <option value="spam">Spam / Deceptive Advertising</option>
                  <option value="other">Other Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Details & Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Explain why this app should be reviewed..."
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
