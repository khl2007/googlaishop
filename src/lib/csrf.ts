
"use client";

/**
 * Retrieves the CSRF token from the document's cookies.
 * This function is intended to be used on the client-side.
 * @returns The CSRF token string, or an empty string if not found.
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') {
    // Return empty string on the server
    return '';
  }
  const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
  if (match && match[2]) {
    return match[2];
  }
  return '';
}
