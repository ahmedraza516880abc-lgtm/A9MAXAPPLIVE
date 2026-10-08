import React from 'react';
import { Star, DownloadCloud } from 'lucide-react';
import { AppItem } from '../types';
import { useApp } from '../context/AppContext';

interface AppCardProps {
  app: AppItem;
  layout?: 'grid' | 'horizontal' | 'compact';
}

export const formatDownloads = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K+';
  return num.toString();
};

export const formatSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
};

export const AppCard: React.FC<AppCardProps> = ({ app, layout = 'grid' }) => {
  const { navigateTo } = useApp();

  const handleClick = () => {
    navigateTo('app-detail', { appId: app.id });
  };

  if (layout === 'horizontal') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 shadow-xs hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all cursor-pointer group"
      >
        <img
          src={app.iconUrl}
          alt={app.name}
          className="w-16 h-16 rounded-2xl object-cover shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0 bg-gray-100 dark:bg-gray-800"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80`;
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {app.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {app.uploaderName}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-0.5 font-medium text-gray-800 dark:text-gray-200">
              {app.rating.toFixed(1)}
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </span>
            <span>•</span>
            <span>{formatSize(app.apkSize)}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <DownloadCloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {formatDownloads(app.downloads)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="flex flex-col p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 shadow-xs hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-900 transition-all cursor-pointer group"
    >
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2.5">
        <img
          src={app.iconUrl}
          alt={app.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80`;
          }}
        />
        <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white rounded-md">
          {app.category}
        </span>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {app.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {app.uploaderName}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
            <span>{app.rating.toFixed(1)}</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[10px]">{formatSize(app.apkSize)}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {formatDownloads(app.downloads)}
          </span>
        </div>
      </div>
    </div>
  );
};
