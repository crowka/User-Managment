import React from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';

export function LoginForm() {
  const { login, isLoading, error } = useAuthStore();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const email = (target.elements.namedItem('email') as HTMLInputElement).value;
    const password = (target.elements.namedItem('password') as HTMLInputElement).value;
    
    // Basic validation
    if (!email.includes('@')) {
      (target.querySelector('#email-error') as HTMLElement).textContent = 'Invalid email address';
      return;
    }
    
    if (password.length < 8) {
      (target.querySelector('#password-error') as HTMLElement).textContent = 'Password must be at least 8 characters';
      return;
    }
    
    login(email, password);
  };
  
  return (
    <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue=""
        />
        <p id="email-error" className="text-sm text-red-500"></p>
      </div>

      <div className="space-y-2">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          defaultValue=""
        />
        <p id="password-error" className="text-sm text-red-500"></p>
      </div>

      {error && (
        <div role="alert">{error}</div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
} 