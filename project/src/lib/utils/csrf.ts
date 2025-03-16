/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 */

// Generate a random CSRF token
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store CSRF token in localStorage with an expiration
export function storeCSRFToken(token: string, expirationMinutes: number = 30): void {
  const expiration = Date.now() + expirationMinutes * 60 * 1000;
  localStorage.setItem('csrf_token', token);
  localStorage.setItem('csrf_token_expiration', expiration.toString());
}

// Get stored CSRF token if it's still valid
export function getCSRFToken(): string | null {
  const token = localStorage.getItem('csrf_token');
  const expiration = localStorage.getItem('csrf_token_expiration');
  
  if (!token || !expiration) {
    return null;
  }
  
  // Check if token is expired
  if (Date.now() > parseInt(expiration, 10)) {
    clearCSRFToken();
    return null;
  }
  
  return token;
}

// Clear CSRF token from storage
export function clearCSRFToken(): void {
  localStorage.removeItem('csrf_token');
  localStorage.removeItem('csrf_token_expiration');
}

// Validate that the provided token matches the stored token
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return !!storedToken && token === storedToken;
}

// Add CSRF token to form data
export function addCSRFToFormData(formData: FormData): FormData {
  const token = getCSRFToken() || generateCSRFToken();
  formData.append('csrf_token', token);
  storeCSRFToken(token);
  return formData;
}

// Add CSRF token to request headers
export function addCSRFToHeaders(headers: Headers): Headers {
  const token = getCSRFToken() || generateCSRFToken();
  headers.append('X-CSRF-Token', token);
  storeCSRFToken(token);
  return headers;
}

// Add CSRF token to URL as a query parameter
export function addCSRFToURL(url: string): string {
  const token = getCSRFToken() || generateCSRFToken();
  const separator = url.includes('?') ? '&' : '?';
  storeCSRFToken(token);
  return `${url}${separator}csrf_token=${token}`;
} 