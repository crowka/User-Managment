import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          common: {
            loading: 'Loading...',
            error: 'An error occurred',
            success: 'Success!',
          },
          auth: {
            signIn: 'Sign In',
            signUp: 'Sign Up',
            email: 'Email',
            password: 'Password',
            forgotPassword: 'Forgot Password?',
          },
          payment: {
            cardNumber: 'Card Number',
            expiryDate: 'Expiry Date',
            cvv: 'CVV',
            submit: 'Submit Payment',
          },
        },
      },
      es: {
        translation: {
          common: {
            loading: 'Cargando...',
            error: 'Se produjo un error',
            success: '¡Éxito!',
          },
          auth: {
            signIn: 'Iniciar Sesión',
            signUp: 'Registrarse',
            email: 'Correo electrónico',
            password: 'Contraseña',
            forgotPassword: '¿Olvidaste tu contraseña?',
          },
          payment: {
            cardNumber: 'Número de tarjeta',
            expiryDate: 'Fecha de vencimiento',
            cvv: 'CVV',
            submit: 'Enviar pago',
          },
        },
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;