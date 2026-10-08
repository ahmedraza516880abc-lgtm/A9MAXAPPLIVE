import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Star } from 'lucide-react';
import { AppItem } from '../types';
import { useApp } from '../context/AppContext';
import { formatDownloads, formatSize } from './AppCard';

interface BannerSliderProps {
  apps: AppItem[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ apps }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { navigateTo, language } = useApp();

  const featuredApps = apps.slice(0, 5);

  useEffect(() => {
    if (featuredApps.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [featuredApps.length]);

  if (featuredApps.length === 0) return null;

  const current = featuredApps[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredApps.length) % featuredApps.length);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gray-900 shadow-xl group my-2 select-none">
      <div 
        onClick={() => navigateTo('app-detail', { appId: current.id })}
        className="relative h-56 sm:h-72 md:h-80 w-full cursor-pointer flex items-end overflow-hidden"
      >
        {/* Background artwork */}
        <img
          src={current.screenshots[0] || current.iconUrl}
          alt={current.name}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-60 scale-105 transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Gradient overlays for Play Store readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-transparent hidden sm:block" />

        {/* Banner content */}
        <div className="relative z-10 p-5 sm:p-7 md:p-9 w-full flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 max-w-xl">
            <img
              src={current.iconUrl}
              alt={current.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20 shrink-0 bg-gray-800"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-md">
                  {language === 'hi' ? 'विशेष फीचर्ड' : 'Featured'}
                </span>
                <span className="text-xs text-emerald-300 font-medium">
                  {current.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight line-clamp-1">
                {current.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 line-clamp-1 sm:line-clamp-2 mt-1">
                {current.shortDescription}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {current.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span>{formatSize(current.apkSize)}</span>
                <span>•</span>
                <span>{formatDownloads(current.downloads)} {language === 'hi' ? 'डाउनलोड्स' : 'downloads'}</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigateTo('app-detail', { appId: current.id });
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'hi' ? 'देखें व डाउनलोड' : 'View & Get APK'}</span>
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {featuredApps.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination indicators */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
            {featuredApps.map((_, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
