import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      auth: {
        login: {
          title: 'Welcome Back',
          forgotPassword: 'Forgot your password?',
          noAccount: "Don't have an account?",
          signUp: 'Sign up',
        },
      },
    },
  },
};

let isInitialized = false;

export function initI18n() {
  if (isInitialized) {
    return i18n;
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

  isInitialized = true;
  return i18n;
}

// Initialize i18n on the client side
if (typeof window !== 'undefined') {
  initI18n();
} 