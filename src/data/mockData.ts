import { AppItem, ReviewItem } from '../types';

export const INITIAL_MOCK_APPS: AppItem[] = [
  {
    id: "app-pixel-craft",
    name: "Pixel Craft 3D",
    category: "Games",
    shortDescription: "Endless sandbox building, crafting, and survival in vibrant voxel worlds.",
    fullDescription: "Step into an infinite procedurally generated voxel universe! Build magnificent castles, craft legendary tools, tame mythical pets, and defend your village against midnight creepers. Features high FPS optimization, custom multiplayer servers, and offline play mode.",
    version: "2.4.1",
    packageName: "com.blockverse.pixelcraft3d",
    iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 64 * 1024 * 1024,
    downloads: 142580,
    rating: 4.8,
    reviewCount: 3120,
    uploaderId: "dev-blockverse",
    uploaderName: "Blockverse Studios",
    status: "approved",
    whatsNew: "- Added Emerald biome and ancient dragon boss\n- 40% memory optimization for low-end devices\n- Fixed gamepad Bluetooth latency",
    minAndroidVersion: "Android 8.0+",
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
    featured: true
  },
  {
    id: "app-pulse-messenger",
    name: "Pulse Messenger",
    category: "Social",
    shortDescription: "Ultra-fast encrypted messaging, HD video calling, and ephemeral media.",
    fullDescription: "Experience truly secure instant communication with zero compromises. End-to-end encrypted chats, crystal-clear voice and video calls, large group collaboration up to 10,000 members, and lightweight data saver mode for 2G/3G networks.",
    version: "4.1.0",
    packageName: "org.pulse.chat",
    iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 28 * 1024 * 1024,
    downloads: 285400,
    rating: 4.9,
    reviewCount: 5210,
    uploaderId: "dev-pulselabs",
    uploaderName: "Pulse Labs Foundation",
    status: "approved",
    whatsNew: "- Introduced animated sticker packs\n- Instant screen sharing during group video calls\n- Enhanced biometric app lock",
    minAndroidVersion: "Android 7.0+",
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
    featured: true
  },
  {
    id: "app-nova-launcher",
    name: "Nova Launcher Elite",
    category: "Tools",
    shortDescription: "Customizable, smooth, and lightweight Android home screen launcher.",
    fullDescription: "Transform your Android experience with extreme personalization. Fluid animations, gesture controls, icon mask customization, hidden apps folder, and backup/restore cloud synchronization. Consumes less than 15MB RAM in background.",
    version: "8.0.3",
    packageName: "com.nova.elite.launcher",
    iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 14 * 1024 * 1024,
    downloads: 198900,
    rating: 4.7,
    reviewCount: 4180,
    uploaderId: "dev-novagroup",
    uploaderName: "Nova Apex Technologies",
    status: "approved",
    whatsNew: "- Android 14 Monet Dynamic Theming engine integration\n- Custom folder blur intensity slider\n- New swipe down global search",
    minAndroidVersion: "Android 8.1+",
    createdAt: Date.now() - 45 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
    featured: true
  },
  {
    id: "app-apex-drift",
    name: "Apex Drift Legends",
    category: "Games",
    shortDescription: "High octane street racing with realistic tire physics and nitrous drift.",
    fullDescription: "Compete against rival street crews across neon-lit Tokyo, Alpine hairpin bends, and dusty canyons. Tune your engine, install custom body kits, neon underglow, and climb the global leaderboard in 60 FPS realistic physics.",
    version: "1.9.5",
    packageName: "com.apexgear.driftlegends",
    iconUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 92 * 1024 * 1024,
    downloads: 87400,
    rating: 4.6,
    reviewCount: 1890,
    uploaderId: "dev-speedworks",
    uploaderName: "SpeedWorks Interactive",
    status: "approved",
    whatsNew: "- 5 new licensed supercars added\n- Night rain weather condition with reflection maps\n- Manual clutch gear mode",
    minAndroidVersion: "Android 9.0+",
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
    featured: true
  },
  {
    id: "app-study-buddy",
    name: "StudyBuddy AI Note",
    category: "Education",
    shortDescription: "Smart study companion with flashcards, lecture summaries, and quiz maker.",
    fullDescription: "Master any exam with your personal AI tutor. Scan textbooks to generate interactive flashcards, record lectures for clean bullet-point summaries, and practice spaced repetition memory drills completely offline.",
    version: "3.2.0",
    packageName: "edu.studybuddy.app",
    iconUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 22 * 1024 * 1024,
    downloads: 142000,
    rating: 4.9,
    reviewCount: 2670,
    uploaderId: "dev-edumind",
    uploaderName: "EduMind Innovations",
    status: "approved",
    whatsNew: "- Math equation OCR recognition\n- Dark mode PDF annotation tools\n- Audio flashcard quiz playback",
    minAndroidVersion: "Android 8.0+",
    createdAt: Date.now() - 50 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
    featured: false
  },
  {
    id: "app-quick-clean",
    name: "QuickClean Optimizer",
    category: "Tools",
    shortDescription: "Clean junk files, monitor CPU temperature, and boost battery health.",
    fullDescription: "Keep your smartphone running at peak speed. Removes lingering cache files, detects duplicate high-res photos, manages background app autostart, and extends battery cycle life with intelligent charging alerts.",
    version: "5.4.2",
    packageName: "com.quickclean.optimizer",
    iconUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 18 * 1024 * 1024,
    downloads: 310500,
    rating: 4.4,
    reviewCount: 6850,
    uploaderId: "dev-syspro",
    uploaderName: "SysPro Utilities",
    status: "approved",
    whatsNew: "- WhatsApp media deep cleaner algorithm\n- Faster junk scan engine\n- Fixed widget crash on Android 13",
    minAndroidVersion: "Android 7.0+",
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
    featured: false
  },
  {
    id: "app-sound-vibe",
    name: "SoundVibe Music Player",
    category: "Entertainment",
    shortDescription: "Hi-Res FLAC audio player with 10-band equalizer and lyrics sync.",
    fullDescription: "Audiophile-grade music player with offline playback, 32-bit DAC support, gapless playback, dynamic bass booster, and embedded synchronized lyrics. Supports FLAC, MP3, WAV, AAC, and OGG formats with album art scraper.",
    version: "2.1.8",
    packageName: "com.soundvibe.player",
    iconUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 31 * 1024 * 1024,
    downloads: 68900,
    rating: 4.6,
    reviewCount: 1420,
    uploaderId: "dev-audiocore",
    uploaderName: "AudioCore Labs",
    status: "approved",
    whatsNew: "- Added sleep timer fade-out\n- Reverb audio effect presets\n- Android Auto integration",
    minAndroidVersion: "Android 8.0+",
    createdAt: Date.now() - 35 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
    featured: false
  },
  {
    id: "app-pending-sample",
    name: "CyberRunner 2088",
    category: "Games",
    shortDescription: "Futuristic neon parkour endless runner with synthwave soundtrack.",
    fullDescription: "Jump, slide, and wall-run across towering skyscrapers in a cyberpunk metropolis while dodging holographic security drones.",
    version: "1.0.0",
    packageName: "com.neontech.cyberrunner",
    iconUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 55 * 1024 * 1024,
    downloads: 0,
    rating: 5.0,
    reviewCount: 0,
    uploaderId: "user-demo-dev",
    uploaderName: "Neon Indie Dev",
    status: "pending",
    whatsNew: "Initial release v1.0.0",
    minAndroidVersion: "Android 8.0+",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    featured: false
  }
];

export const INITIAL_MOCK_REVIEWS: Record<string, ReviewItem[]> = {
  "app-pixel-craft": [
    {
      id: "rev-1",
      userId: "u-alex",
      userName: "Alex Rover",
      userPhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      comment: "Best sandbox game on mobile! Runs at a super smooth 60fps on my mid-range phone and controls are very intuitive.",
      createdAt: Date.now() - 86400000 * 3
    },
    {
      id: "rev-2",
      userId: "u-sarah",
      userName: "Sarah Jenkins",
      userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      comment: "The new Emerald biome update is fantastic. My kids and I play together via local Wi-Fi constantly.",
      createdAt: Date.now() - 86400000 * 6
    },
    {
      id: "rev-3",
      userId: "u-rahul",
      userName: "Rahul Sharma",
      userPhoto: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      rating: 4,
      comment: "Super addictive and clean gameplay. Would love to see more furniture crafting recipes in the next update!",
      createdAt: Date.now() - 86400000 * 12
    }
  ],
  "app-pulse-messenger": [
    {
      id: "rev-4",
      userId: "u-elena",
      userName: "Elena Rostova",
      userPhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      comment: "Extremely fast and battery friendly. Group calls never drop even on spotty connections.",
      createdAt: Date.now() - 86400000 * 2
    }
  ]
};
