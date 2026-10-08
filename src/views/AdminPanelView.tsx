import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  AlertTriangle, 
  Flag, 
  UserX, 
  DownloadCloud, 
  Layers, 
  Users, 
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AppItem, ReportItem } from '../types';
import { 
  getPendingApps, 
  setAppStatus, 
  deleteApp, 
  getReports, 
  dismissReport, 
  banUser,
  getApprovedApps 
} from '../services/firebase';
import { useApp } from '../context/AppContext';
import { formatDownloads, formatSize } from '../components/AppCard';

export const AdminPanelView: React.FC = () => {
  const { isAdmin, currentUser, navigateTo, language, t, showToast } = useApp();

  const [pendingApps, setPendingApps] = useState<AppItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [allApps, setAllApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Ban user state
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  // Active admin tab
  const [adminTab, setAdminTab] = useState<'pending' | 'reports' | 'all'>('pending');

  useEffect(() => {
    if (!isAdmin) return;

    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [pending, reps, approved] = await Promise.all([
          getPendingApps(),
          getReports(),
          getApprovedApps()
        ]);
        setPendingApps(pending);
        setReports(reps);
        setAllApps([...approved, ...pending]);
      } catch (err) {
        console.error("Error loading admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [isAdmin]);

  // Guard: Admin check
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          This panel is restricted to verified administrators: <code>ahmeda9a99a9@gmail.com</code>.
        </p>
        <button
          onClick={() => navigateTo('home')}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  // Handle Approve App
  const handleApprove = async (appId: string) => {
    try {
      await setAppStatus(appId, 'approved');
      setPendingApps(prev => prev.filter(a => a.id !== appId));
      showToast(language === 'hi' ? 'ऐप स्वीकृत किया गया और स्टोर में लाइव है!' : 'App approved and published live to the store!');
    } catch (err: any) {
      showToast(err.message || 'Error approving app', 'error');
    }
  };

  // Handle Reject App
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAppId) return;

    try {
      await setAppStatus(rejectingAppId, 'rejected', rejectionReasonInput.trim() || 'Did not meet store safety or content guidelines.');
      setPendingApps(prev => prev.filter(a => a.id !== rejectingAppId));
      setRejectingAppId(null);
      setRejectionReasonInput('');
      showToast(language === 'hi' ? 'ऐप अस्वीकृत कर दिया गया।' : 'App rejected and developer notified.');
    } catch (err: any) {
      showToast(err.message || 'Error rejecting app', 'error');
    }
  };

  // Handle Delete App
  const handleDelete = async (appId: string) => {
    try {
      await deleteApp(appId);
      setPendingApps(prev => prev.filter(a => a.id !== appId));
      setAllApps(prev => prev.filter(a => a.id !== appId));
      showToast('App deleted permanently.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Dismiss Report
  const handleDismissReport = async (reportId: string) => {
    try {
      await dismissReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      showToast('Report dismissed.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Ban User
  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId);
      setBanningUserId(null);
      showToast('User has been banned and prevented from publishing.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Store Overview Metrics
  const totalAppsCount = allApps.length;
  const totalDownloads = allApps.reduce((acc, c) => acc + (c.downloads || 0), 0);
  const totalPendingCount = pendingApps.length;
  const totalReportsCount = reports.length;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12 space-y-6">
      
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {t.adminPanel}
              </h1>
              <p className="text-xs text-gray-400">
                Logged in as <code>{currentUser?.email}</code>
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 self-start sm:self-center">
            Super Administrator
          </span>
        </div>

        {/* Global Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white block">
              {totalAppsCount}
            </span>
            <span className="text-[11px] text-gray-400">{t.totalApps}</span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white block">
              {formatDownloads(totalDownloads)}
            </span>
            <span className="text-[11px] text-gray-400">{t.totalDownloads}</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
            <span className="text-xl sm:text-2xl font-black block">
              {totalPendingCount}
            </span>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Pending Review</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200">
            <span className="text-xl sm:text-2xl font-black block">
              {totalReportsCount}
            </span>
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">Active Reports</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-6">
        <button
          onClick={() => setAdminTab('pending')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            adminTab === 'pending'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.pendingApps} ({pendingApps.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('reports')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            adminTab === 'reports'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>{t.reportedApps} ({reports.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('all')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            adminTab === 'all'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Apps Catalog</span>
        </button>
      </div>

      {/* TAB 1: PENDING APPS */}
      {adminTab === 'pending' && (
        <div className="space-y-4">
          {pendingApps.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 text-sm">
              All submissions are clear! No pending APKs awaiting review.
            </div>
          ) : (
            pendingApps.map(app => (
              <div
                key={app.id}
                className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={app.iconUrl}
                    alt={app.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-gray-100 dark:bg-gray-800 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                        {app.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Developer: <strong className="text-gray-700 dark:text-gray-200">{app.uploaderName}</strong> ({app.uploaderId})
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      Package: {app.packageName} • v{app.version} • {formatSize(app.apkSize)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 max-w-xl">
                      {app.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Actions: Approve / Reject / Download APK to inspect */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <a
                    href={app.apkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Inspect APK
                  </a>

                  <button
                    onClick={() => handleApprove(app.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => setRejectingAppId(app.id)}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 transition"
                    title="Delete Submission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: REPORTS */}
      {adminTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 text-sm">
              No reports reported by users.
            </div>
          ) : (
            reports.map(rep => (
              <div
                key={rep.id}
                className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      App: {rep.appName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {rep.reason}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    "{rep.details}"
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Reporter ID: {rep.reporterId} • {new Date(rep.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleBanUser(rep.reporterId)}
                    className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Ban Reporter / User</span>
                  </button>

                  <button
                    onClick={() => handleDismissReport(rep.id)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ALL APPS CATALOG */}
      {adminTab === 'all' && (
        <div className="space-y-3">
          {allApps.map(app => (
            <div
              key={app.id}
              className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={app.iconUrl}
                  alt={app.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {app.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {app.category} • {formatDownloads(app.downloads)} downloads • status: {app.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('app-detail', { appId: app.id })}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  View Page
                </button>
                <button
                  onClick={() => handleDelete(app.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Enter Rejection Reason */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              {t.reject}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {t.enterRejectionReason}
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Package contains broken assets or violates safety guidelines..."
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingAppId(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
