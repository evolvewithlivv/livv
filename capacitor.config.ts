import type { CapacitorConfig } from '@capacitor/cli';

/**
 * LIVV native shell configuration.
 *
 * Strategy: Live-server mode.
 * The native iOS/Android containers load the production (or preview) Vercel URL.
 * This preserves all Next.js App Router, API routes, Stripe, Supabase Auth,
 * server entitlements, and Evala without requiring a static export.
 *
 * After changing this file or the web app:
 *   npx cap sync
 *   npx cap open ios   # or android
 */
const config: CapacitorConfig = {
  appId: 'com.evolvewithlivv.livv',
  appName: 'LIVV',
  webDir: 'public', // placeholder; live server.url is the source of truth
  server: {
    // Production domain (update if the canonical host changes)
    url: 'https://evolvewithlivv.com',
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#030405',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#030405',
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'LIVV',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#030405',
  },
};

export default config;
