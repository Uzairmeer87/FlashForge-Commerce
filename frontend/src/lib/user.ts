export function getOrSetUserId(): string {
  if (typeof window === 'undefined') {
    return 'user_guest_server';
  }

  const STORAGE_KEY = 'flashforge_user_id';
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    userId = `user_guest_${randomSuffix}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}
