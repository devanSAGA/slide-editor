/**
 * Generate and manage anonymous user IDs
 * Each user gets a unique ID stored in localStorage
 */

const USER_ID_KEY = 'slide-editor-user-id';

export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // Generate a new unique user ID
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomId = Math.random().toString(36).substring(2, 9);
  return `user_${timestamp}_${randomId}`;
}

export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}
