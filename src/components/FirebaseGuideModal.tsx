import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, Database, HardDrive, Globe, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FirebaseGuideModal: React.FC = () => {
  const { guideModalOpen, setGuideModalOpen, language } = useApp();
  const [copiedRules, setCopiedRules] = useState<'firestore' | 'storage' | null>(null);

  if (!guideModalOpen) return null;

  const handleCopy = (type: 'firestore' | 'storage', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRules(type);
    setTimeout(() => setCopiedRules(null), 2500);
  };

  const firestoreRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isAdmin() { return isSignedIn() && request.auth.token.email == "ahmeda9a99a9@gmail.com"; }
    function isNotBanned() { return isSignedIn() && (!exists(/databases/$(database)/documents/banned_users/$(request.auth.uid))); }

    match /users/{userId} {
      allow read: if true;
      allow create, update: if isOwner(userId) && isNotBanned();
      allow delete: if isOwner(userId) || isAdmin();
    }
    match /users_private/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if (isOwner(userId) && isNotBanned()) || isAdmin();
    }
    match /apps/{appId} {
      allow read: if resource.data.status == 'approved' || (isSignedIn() && resource.data.uploaderId == request.auth.uid) || isAdmin();
      allow create: if isSignedIn() && isNotBanned() && request.resource.data.uploaderId == request.auth.uid && request.resource.data.status == 'pending';
      allow update: if isAdmin() || (isSignedIn() && isNotBanned() && resource.data.uploaderId == request.auth.uid && request.resource.data.status == 'pending') || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['downloads']) && request.resource.data.downloads == resource.data.downloads + 1);
      allow delete: if isAdmin() || (isSignedIn() && resource.data.uploaderId == request.auth.uid);

      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if isSignedIn() && isNotBanned() && reviewId == request.auth.uid && request.resource.data.userId == request.auth.uid && request.resource.data.rating >= 1 && request.resource.data.rating <= 5;
        allow update: if isSignedIn() && isNotBanned() && resource.data.userId == request.auth.uid && request.resource.data.userId == request.auth.uid;
        allow delete: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      }
    }
    match /reports/{reportId} {
      allow read: if isAdmin();
      allow create: if isSignedIn() && isNotBanned() && request.resource.data.reporterId == request.auth.uid;
      allow update, delete: if isAdmin();
    }
    match /banned_users/{userId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}`;

  const storageRulesText = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && request.auth.token.email == "ahmeda9a99a9@gmail.com"; }

    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if (isSignedIn() && request.auth.uid == userId && request.resource.size < 2 * 1024 * 1024 && request.resource.contentType.matches('image/.*')) || isAdmin();
      allow delete: if (isSignedIn() && request.auth.uid == userId) || isAdmin();
    }
    match /apps/{appId}/images/{allPaths=**} {
      allow read: if true;
      allow write: if (isSignedIn() && request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/.*')) || isAdmin();
      allow delete: if isSignedIn() || isAdmin();
    }
    match /apps/{appId}/apk/{allPaths=**} {
      allow read: if true;
      allow write: if (isSignedIn() && request.resource.size < 100 * 1024 * 1024 && (request.resource.contentType.matches('application/vnd.android.package-archive') || request.resource.contentType.matches('application/octet-stream') || request.resource.name.matches('.*\\\\.apk'))) || isAdmin();
      allow delete: if isSignedIn() || isAdmin();
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {language === 'hi' ? 'Firebase और GitHub Pages आसान सेटअप गाइड' : 'Firebase & GitHub Pages Deployment Guide'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin: ahmeda9a99a9@gmail.com
              </p>
            </div>
          </div>
          <button
            onClick={() => setGuideModalOpen(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-5 space-y-6 text-sm text-gray-700 dark:text-gray-300 pr-2">
          
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>1.</span> Firebase प्रोजेक्ट बनाएं (Create Firebase Project)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium inline-flex items-center gap-1">
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a> पर जाएं और <strong>"Add project"</strong> पर क्लिक करें। अपने प्रोजेक्ट का नाम (उदा. DroidStore) रखें और Create Project करें।
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>2.</span> Authentication सक्षम करें (Google + Email/Password)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Left menu में <strong>Build &gt; Authentication</strong> पर जाएं। <strong>Get Started</strong> दबाएं। <strong>Sign-in method</strong> में जाकर:
              <br />• <strong>Email/Password</strong> को Enable करें।
              <br />• <strong>Google</strong> को Enable करें और सपोर्ट ईमेल (Support email) में अपना Gmail चुनें।
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>3.</span> Cloud Firestore और Storage चालू करें (Blaze Plan & Budget Alert)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              • <strong>Firestore Database</strong> पर जाएं &gt; Create Database करें &gt; Production mode चुनें &gt; Cloud region (asia-south1 या us-central1) चुनें।
              <br />• <strong>Storage</strong> पर जाएं &gt; Get Started करें &gt; Done करें।
              <br />• <em>सुझाव (Tip):</em> यदि 100MB APK अपलोड के लिए Blaze (Pay-as-you-go) प्लान मांगता है, तो Firebase में Blaze अपग्रेड करें और <strong>GCP Console &gt; Billing &gt; Budgets & Alerts</strong> में जाकर ₹100 या $1 का बजट अलर्ट सेट कर लें ताकि कोई भी अनचाहा चार्ज न लगे।
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>4.</span> Web Config को <code>src/firebaseConfig.js</code> में पेस्ट करें
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
              Firebase Console में <strong>Project Overview (Gear Icon) &gt; Project settings &gt; General &gt; Your apps &gt; Web (<code>&lt;/&gt;</code>)</strong> पर क्लिक करें। ऐप रजिस्टर करें और मिले हुए <code>firebaseConfig</code> ऑब्जेक्ट को <code>src/firebaseConfig.js</code> में पेस्ट कर दें।
            </p>
          </div>

          {/* Step 5 & 6 Rules */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span>5 & 6.</span> Firestore और Storage Rules पेस्ट करें
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Admin ईमेल <code>ahmeda9a99a9@gmail.com</code> इन दोनों रूल्स में पूरी तरह एन्फोर्स्ड है। नीचे दिए गए बटनों से कॉपी करें और Firebase Console में पेस्ट करके <strong>Publish</strong> दबाएं:
            </p>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleCopy('firestore', firestoreRulesText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                {copiedRules === 'firestore' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Firestore Rules</span>
              </button>

              <button
                onClick={() => handleCopy('storage', storageRulesText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 text-white dark:bg-gray-700 text-xs font-semibold hover:bg-gray-900 transition"
              >
                {copiedRules === 'storage' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Storage Rules</span>
              </button>
            </div>
          </div>

          {/* Step 7 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>7.</span> Authorized Domains में GitHub Pages जोड़ें
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Firebase Console &gt; <strong>Authentication &gt; Settings &gt; Authorized domains</strong> में जाएं। <strong>"Add domain"</strong> दबाएं और अपना डोमेन (जैसे: <code>yourusername.github.io</code>) जोड़ें, ताकि Google Sign-in बिना किसी एरर के काम करे।
            </p>
          </div>

          {/* Step 8 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>8.</span> GitHub Pages पर ऑटोमैटिक डिप्लॉयमेंट (Ready Workflow)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              प्रोजेक्ट में पहले से ही <code>.github/workflows/deploy.yml</code> बना हुआ है!
              <br />1. अपने कोड को GitHub रिपॉजिटरी में पुश करें।
              <br />2. GitHub Repo में जाकर <strong>Settings &gt; Pages</strong> खोलें।
              <br />3. <strong>Build and deployment &gt; Source</strong> में <strong>"GitHub Actions"</strong> चुनें।
              <br />4. Actions टैब में डिप्लॉयमेंट ऑटोमैटिक शुरू हो जाएगा और कुछ ही पलों में साइट लाइव हो जाएगी!
            </p>
          </div>

          {/* Step 9 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>9.</span> Google और GitHub पर 2-Step Verification कैसे ऑन करें
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
              <p>
                <strong>Google Account:</strong> <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-emerald-600 underline">myaccount.google.com/security</a> पर जाएं &gt; "2-Step Verification" पर क्लिक करें &gt; अपना मोबाइल नंबर या Google Authenticator ऐप लिंक करें।
              </p>
              <p>
                <strong>GitHub Account:</strong> <a href="https://github.com/settings/security" target="_blank" rel="noreferrer" className="text-emerald-600 underline">github.com/settings/security</a> पर जाएं &gt; "Two-factor authentication" में Enable 2FA करें &gt; Authenticator ऐप (Google Authenticator) से QR कोड स्कैन करें और रिकवरी कोड सुरक्षित सेव करें।
              </p>
            </div>
          </div>

        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={() => setGuideModalOpen(false)}
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            {language === 'hi' ? 'समझ गया (Close)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
