export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'VIP Shopper' | 'Flash Collector' | 'Guest' | 'Beta Tester';
}

export const PRESET_PROFILES: UserProfile[] = [
  {
    id: 'user_alex_vip',
    name: 'Alex Rivers',
    email: 'alex.rivers@flashforge.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    role: 'VIP Shopper',
  },
  {
    id: 'user_elena_collector',
    name: 'Elena Rostova',
    email: 'elena.r@flashforge.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
    role: 'Flash Collector',
  },
  {
    id: 'user_marcus_hunter',
    name: 'Marcus Vance',
    email: 'marcus.v@flashforge.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    role: 'Beta Tester',
  },
];

const STORAGE_KEY = 'flashforge_active_user_profile';

export function getActiveUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return PRESET_PROFILES[0];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.name) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read active user profile', e);
  }

  // Default to first profile if not saved
  const defaultProfile = PRESET_PROFILES[0];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
}

export function setActiveUserProfile(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem('flashforge_user_id', profile.id);
    // Dispatch custom event to notify components
    window.dispatchEvent(new Event('flashforge_user_changed'));
  }
}

export function getOrSetUserId(): string {
  const active = getActiveUserProfile();
  return active.id;
}
