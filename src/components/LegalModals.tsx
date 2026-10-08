import React from 'react';
import { X, ShieldAlert, FileText, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LegalModals: React.FC = () => {
  const { legalModal, setLegalModal, language } = useApp();

  if (!legalModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            {legalModal === 'terms' && <FileText className="w-5 h-5 text-emerald-600" />}
            {legalModal === 'privacy' && <Lock className="w-5 h-5 text-emerald-600" />}
            {legalModal === 'dmca' && <ShieldAlert className="w-5 h-5 text-emerald-600" />}
            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {legalModal === 'terms' && (language === 'hi' ? 'सेवा की शर्तें (Terms of Service)' : 'Terms of Service')}
              {legalModal === 'privacy' && (language === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy')}
              {legalModal === 'dmca' && (language === 'hi' ? 'DMCA व कॉपीराइट दिशानिर्देश' : 'DMCA & Copyright Policy')}
            </h2>
          </div>
          <button
            onClick={() => setLegalModal(null)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed pr-2">
          {legalModal === 'terms' && (
            <>
              <p>
                <strong>1. Acceptance of Terms:</strong> By browsing, uploading, or downloading applications from DroidStore, you agree to comply with and be bound by these Terms of Service.
              </p>
              <p>
                <strong>2. Developer Conduct & APK Publishing:</strong> Developers uploading APKs warrant that they own or hold authorized licensing for all intellectual property, binaries, assets, and source materials. Uploading malware, spyware, trojans, ransomware, or deceptive adware will result in permanent account termination and IP-level blacklisting.
              </p>
              <p>
                <strong>3. Review Process:</strong> All uploaded APKs undergo administrative safety verification before publication. DroidStore reserves the right to reject, suspend, or delist any APK at its sole discretion.
              </p>
              <p>
                <strong>4. Limitation of Liability:</strong> DroidStore provides a free distribution platform. Users install third-party APKs at their own discretion. Always verify permissions before installing third-party applications on Android devices.
              </p>
            </>
          )}

          {legalModal === 'privacy' && (
            <>
              <p>
                <strong>1. User Privacy Architecture:</strong> DroidStore strictly safeguards user privacy. Public profile collections (<code>users</code>) contain only your public display name, avatar, bio, and social link.
              </p>
              <p>
                <strong>2. Isolation of Email & Private Information:</strong> All email addresses and internal credentials are stored exclusively inside protected documents (<code>users_private</code>) accessible solely by you and verified system administrators. Public visitors and other developers can NEVER inspect or view your email address.
              </p>
              <p>
                <strong>3. Data Collection:</strong> We collect only essential authentication identifiers via Firebase Authentication to authenticate APK uploads and prevent spam. We do not sell user data to advertising networks.
              </p>
              <p>
                <strong>4. Right to Deletion:</strong> Any user can permanently delete their account and purge their profile data at any time directly through the Profile Settings tab.
              </p>
            </>
          )}

          {legalModal === 'dmca' && (
            <>
              <p>
                <strong>1. Copyright Infringement Notice:</strong> DroidStore respects the intellectual property rights of creators and software authors. If you are a copyright owner or authorized representative and believe an APK infringes your copyright, please submit a report immediately.
              </p>
              <p>
                <strong>2. How to File a DMCA Notice:</strong> Use the "Report this app" button directly on the APK detail page, select reason "DMCA / Copyright Violation", and include proof of ownership or registration. Alternatively, contact the lead administrator at <code>ahmeda9a99a9@gmail.com</code>.
              </p>
              <p>
                <strong>3. Repeat Infringer Policy:</strong> Accounts that repeatedly upload copyright-infringing content will have all uploaded files permanently removed and their user credentials banned.
              </p>
            </>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={() => setLegalModal(null)}
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
