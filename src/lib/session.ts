import { cookies } from 'next/headers';
import type { User } from '@/lib/types';

export async function getUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('user_session');

  if (sessionCookie?.value) {
    try {
      // Manually parse to avoid using `as` in a way that might be unsafe
      // if the cookie format changes.
      const parsed = JSON.parse(sessionCookie.value);
      const user: User = {
        id: parsed.id,
        username: parsed.username,
        fullName: parsed.fullName,
        role: parsed.role
      };
      return user;
    } catch (e) {
      console.error('Failed to parse session cookie', e);
      // If parsing fails, the cookie is invalid, so treat as logged out.
      return null;
    }
  }
  return null;
}
