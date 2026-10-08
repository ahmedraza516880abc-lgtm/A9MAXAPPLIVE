import React, { useState } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Plus, 
  Layers, 
  Info,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { AppCategory, AppItem } from '../types';
import { 
  uploadFile, 
  submitApp, 
  getUserApps 
} from '../services/firebase';
import { 
  APP_CATEGORIES, 
  MAX_UPLOADS_PER_DAY, 
  MAX_APK_SIZE_BYTES, 
  MAX_IMAGE_SIZE_BYTES 
} from '../config.js';
import { useApp } from '../context/AppContext';

export const UploadView: React.FC = () => {
  const { currentUser, setAuthModalOpen, navigateTo, language, t, showToast } = useApp();

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AppCategory>('Games');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [packageName, setPackageName] = useState('');
  const [whatsNew, setWhatsNew] = useState('');

  // Files
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [apkFile, setApkFile] = useState<File | null>(null);

  // Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Guard: Not logged in
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t.uploadTitle}
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

  // Handle Icon Select
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Icon must be an image file (PNG, JPG, WebP).');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setErrorMsg('Icon image must be less than 5 MB.');
        return;
      }
      setErrorMsg('');
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // Handle Screenshots Select (up to 6)
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combined = [...screenshotFiles, ...newFiles].slice(0, 6);

      for (const f of newFiles) {
        if (!f.type.startsWith('image/')) {
          setErrorMsg('Screenshots must be image files.');
          return;
        }
        if (f.size > MAX_IMAGE_SIZE_BYTES) {
          setErrorMsg('Each screenshot must be under 5 MB.');
          return;
        }
      }

      setErrorMsg('');
      setScreenshotFiles(combined);
      setScreenshotPreviews(combined.map(f => URL.createObjectURL(f)));
    }
  };

  const removeScreenshot = (index: number) => {
    const updatedFiles = screenshotFiles.filter((_, i) => i !== index);
    setScreenshotFiles(updatedFiles);
    setScreenshotPreviews(updatedFiles.map(f => URL.createObjectURL(f)));
  };

  // Handle APK File Select
  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isApk = file.name.toLowerCase().endsWith('.apk');
      if (!isApk) {
        setErrorMsg('File must have an .apk extension.');
        return;
      }
      if (file.size > MAX_APK_SIZE_BYTES) {
        setErrorMsg('APK file must not exceed 100 MB.');
        return;
      }
      setErrorMsg('');
      setApkFile(file);
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!name.trim()) return setErrorMsg('App Name is required.');
    if (!packageName.trim() || !packageName.includes('.')) return setErrorMsg('Valid package name required (e.g. com.example.game)');
    if (!iconFile) return setErrorMsg('Please choose an App Icon image.');
    if (!apkFile) return setErrorMsg('Please select an Android APK file (.apk).');

    try {
      setIsUploading(true);
      setUploadPercent(5);
      setUploadStage('Checking daily upload limit...');

      // Check daily rate limit: max 5 uploads per day
      const userApps = await getUserApps(currentUser.uid);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const todayUploads = userApps.filter(a => a.createdAt > oneDayAgo);
      if (todayUploads.length >= MAX_UPLOADS_PER_DAY) {
        throw new Error(`You have reached the limit of ${MAX_UPLOADS_PER_DAY} uploads per day. Please try again tomorrow.`);
      }

      const tempAppId = 'temp-' + Date.now();

      // 1. Upload Icon
      setUploadStage('Uploading App Icon...');
      setUploadPercent(15);
      const iconUrl = await uploadFile('apps', tempAppId, 'images', iconFile, (pct) => {
        setUploadPercent(15 + Math.round(pct * 0.2));
      });

      // 2. Upload Screenshots
      const screenshotUrls: string[] = [];
      if (screenshotFiles.length > 0) {
        setUploadStage('Uploading screenshots...');
        for (let i = 0; i < screenshotFiles.length; i++) {
          const url = await uploadFile('apps', tempAppId, 'images', screenshotFiles[i]);
          screenshotUrls.push(url);
          setUploadPercent(35 + Math.round((i / screenshotFiles.length) * 25));
        }
      } else {
        // Use default screenshot preview
        screenshotUrls.push(iconUrl);
      }

      // 3. Upload APK
      setUploadStage('Uploading Android APK package (this may take a moment)...');
      const apkUrl = await uploadFile('apps', tempAppId, 'apk', apkFile, (pct) => {
        setUploadPercent(60 + Math.round(pct * 0.35));
      });

      // 4. Save metadata to Firestore
      setUploadStage('Registering application in database...');
      setUploadPercent(98);

      const appData: Omit<AppItem, 'id'> = {
        name: name.trim(),
        category,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        version: version.trim() || '1.0.0',
        packageName: packageName.trim().toLowerCase(),
        iconUrl,
        screenshots: screenshotUrls,
        apkUrl,
        apkSize: apkFile.size,
        downloads: 0,
        rating: 5.0,
        reviewCount: 0,
        uploaderId: currentUser.uid,
        uploaderName: currentUser.displayName || 'Independent Developer',
        status: 'pending', // Enforced!
        whatsNew: whatsNew.trim() || 'Initial release',
        minAndroidVersion: 'Android 8.0+',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        featured: false
      };

      await submitApp(appData);

      setUploadPercent(100);
      setUploadStage('Done!');
      showToast(language === 'hi' ? 'ऐप सबमिट हो गया! एडमिन अप्रूवल के बाद यह लाइव होगा।' : 'App submitted successfully! Pending admin approval.');
      navigateTo('my-apps');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to upload app. Please check files and network.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12 space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          {t.uploadTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.uploadSubtitle}
        </p>

        {/* Info banners */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{t.pendingNotice}</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-blue-800 dark:text-blue-200 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <span>{t.dailyLimitNotice}</span>
          </div>
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-emerald-300 dark:border-emerald-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-800 dark:text-gray-200">
            <span>{uploadStage}</span>
            <span className="text-emerald-600 font-bold">{uploadPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-emerald-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 text-xs sm:text-sm flex items-center gap-2.5 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
        
        {/* App Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.appNameLabel} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Drift Racing"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.categoryLabel} *
            </label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            >
              {APP_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Package name & Version */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.packageLabel} *
            </label>
            <input
              type="text"
              required
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="e.g. com.mycompany.myapp"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.versionLabel} *
            </label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.shortDescLabel} *
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="High-speed racing game with nitro drifts and customizable cars."
            className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.fullDescLabel} *
          </label>
          <textarea
            required
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed overview of key gameplay features, levels, modes, offline play..."
            className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* What's new */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.whatsNewLabel}
          </label>
          <textarea
            rows={2}
            value={whatsNew}
            onChange={(e) => setWhatsNew(e.target.value)}
            placeholder="- Added new maps&#10;- Fixed Bluetooth controller lag"
            className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* File 1: App Icon */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.appIconLabel} *
          </label>
          <div className="flex items-center gap-4">
            {iconPreview ? (
              <div className="relative">
                <img
                  src={iconPreview}
                  alt="Icon Preview"
                  className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIconFile(null);
                    setIconPreview(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 transition">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Choose Icon (PNG/JPG, max 5MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* File 2: Screenshots (up to 6) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.screenshotsLabel}
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            {screenshotPreviews.map((preview, idx) => (
              <div key={idx} className="relative">
                <img
                  src={preview}
                  alt={`Screenshot ${idx}`}
                  className="w-20 h-28 object-cover rounded-xl shadow-xs border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(idx)}
                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-600 text-white shadow-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {screenshotFiles.length < 6 && (
              <label className="w-20 h-28 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 cursor-pointer text-gray-400 hover:text-emerald-600 transition">
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-[10px] text-center px-1 font-medium">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotsChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* File 3: APK File */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.apkFileLabel} *
          </label>
          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 cursor-pointer transition bg-gray-50/50 dark:bg-gray-800/30">
            <FileCode className="w-8 h-8 text-emerald-600 mb-2" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {apkFile ? apkFile.name : 'Select or drop .apk file here'}
            </span>
            <span className="text-xs text-gray-400 mt-0.5">
              {apkFile ? `File Size: ${(apkFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Android Package Archive (Max 100 MB)'}
            </span>
            <input
              type="file"
              accept=".apk,application/vnd.android.package-archive"
              onChange={handleApkChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 active:scale-99 transition disabled:opacity-50"
          >
            {isUploading ? 'Uploading & Registering...' : t.uploadButton}
          </button>
        </div>

      </form>

    </div>
  );
};
