export const PLATFORMS = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'musical-notes',
    iconFamily: 'Ionicons',
    gradient: ['#FF0050', '#00F2EA'],
    glowColor: 'rgba(255, 0, 80, 0.3)',
    patterns: [
      /tiktok\.com/i,
      /vm\.tiktok\.com/i,
      /vt\.tiktok\.com/i,
    ],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'logo-instagram',
    iconFamily: 'Ionicons',
    gradient: ['#F58529', '#DD2A7B', '#8134AF'],
    glowColor: 'rgba(221, 42, 123, 0.3)',
    patterns: [
      /instagram\.com/i,
      /instagr\.am/i,
    ],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: 'logo-facebook',
    iconFamily: 'Ionicons',
    gradient: ['#1877F2', '#42A5F5'],
    glowColor: 'rgba(24, 119, 242, 0.3)',
    patterns: [
      /facebook\.com/i,
      /fb\.watch/i,
      /fb\.com/i,
      /m\.facebook\.com/i,
    ],
  },
};

export const VIDEO_QUALITIES = [
  { label: '1080p (Full HD)', value: '1080' },
  { label: '720p (HD)', value: '720' },
  { label: '480p (SD)', value: '480' },
  { label: '360p', value: '360' },
  { label: 'Máxima calidad', value: 'max' },
];

export const DEFAULT_QUALITY = '1080';

// Default Cobalt API URL - user can change in settings
export const DEFAULT_API_URL = 'https://cobalt-production-c058.up.railway.app';
