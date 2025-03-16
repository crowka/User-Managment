import { api } from '../api/axios';

export type Platform = 'web' | 'ios' | 'android' | 'react-native';

export interface NotificationConfig {
  enabled: boolean;
  platform?: Platform;
  providers: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    marketing?: boolean;
    inApp?: boolean;
  };
  apiEndpoint?: string;
  // Mobile-specific configuration
  mobileConfig?: {
    fcmToken?: string;       // Firebase Cloud Messaging token for Android
    apnsToken?: string;      // Apple Push Notification Service token for iOS
    deviceId?: string;       // Unique device identifier
    nativeHandler?: (payload: NotificationPayload) => Promise<void>; // Native handler for mobile
  };
}

export interface NotificationPayload {
  type: 'email' | 'push' | 'sms' | 'marketing' | 'inApp';
  title: string;
  message: string;
  data?: Record<string, any>;
  // Mobile-specific fields
  priority?: 'default' | 'high' | 'max';
  badge?: number;
  sound?: string;
  channel?: string; // Android notification channel
}

class NotificationService {
  private config: NotificationConfig = {
    enabled: false,
    platform: 'web',
    providers: {},
    apiEndpoint: '/notifications',
  };

  constructor(config?: Partial<NotificationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  setConfig(config: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...config };
  }

  isEnabled() {
    return this.config.enabled;
  }

  isProviderEnabled(provider: keyof NotificationConfig['providers']) {
    return this.config.enabled && this.config.providers[provider] === true;
  }

  getPlatform(): Platform {
    return this.config.platform || 'web';
  }

  isMobilePlatform() {
    const platform = this.getPlatform();
    return platform === 'ios' || platform === 'android' || platform === 'react-native';
  }

  async send(payload: NotificationPayload) {
    if (!this.isEnabled() || !this.isProviderEnabled(payload.type)) {
      return;
    }

    try {
      // If we have a native handler for mobile and this is a mobile platform, use it
      if (this.isMobilePlatform() && this.config.mobileConfig?.nativeHandler && payload.type === 'push') {
        return this.config.mobileConfig.nativeHandler(payload);
      }

      // Add platform-specific data to the payload
      const platformPayload = this.addPlatformData(payload);
      
      // Send via API
      await api.post(this.config.apiEndpoint!, platformPayload);
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't throw the error to prevent breaking the main application flow
    }
  }

  private addPlatformData(payload: NotificationPayload): NotificationPayload & { platform?: any } {
    const platform = this.getPlatform();
    const finalPayload = { ...payload, platform };

    // Add platform-specific tokens
    if (platform === 'android' && this.config.mobileConfig?.fcmToken) {
      finalPayload.data = {
        ...finalPayload.data,
        fcmToken: this.config.mobileConfig.fcmToken,
      };
    } else if (platform === 'ios' && this.config.mobileConfig?.apnsToken) {
      finalPayload.data = {
        ...finalPayload.data,
        apnsToken: this.config.mobileConfig.apnsToken,
      };
    }

    // Add device ID if available
    if (this.config.mobileConfig?.deviceId) {
      finalPayload.data = {
        ...finalPayload.data,
        deviceId: this.config.mobileConfig.deviceId,
      };
    }

    return finalPayload;
  }

  // Helper methods for different notification types
  async sendEmail(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'email', title, message, data });
  }

  async sendPush(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'push', title, message, data });
  }

  async sendSMS(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'sms', title, message, data });
  }

  async sendMarketing(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'marketing', title, message, data });
  }

  async sendInApp(title: string, message: string, data?: Record<string, any>) {
    return this.send({ type: 'inApp', title, message, data });
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();

// Export a function to initialize the service with custom config
export const initializeNotifications = (config: Partial<NotificationConfig>) => {
  notificationService.setConfig(config);
}; 