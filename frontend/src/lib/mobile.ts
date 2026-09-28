import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const initMobileApp = (navigateBack?: () => void) => {
  if (!isNativeApp()) return;

  // Configure Native Status Bar
  try {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#12304A' });
  } catch (e) {
    console.debug('StatusBar not supported', e);
  }

  // Hide Splash Screen cleanly after app hydrates
  try {
    SplashScreen.hide();
  } catch (e) {
    console.debug('SplashScreen not supported', e);
  }

  // Handle Native Android Hardware Back Button
  try {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      const currentPath = window.location.pathname;

      // On root or main landing/dashboards, exit the app
      if (
        currentPath === '/' ||
        currentPath === '/login' ||
        currentPath === '/student/dashboard' ||
        currentPath === '/provider/dashboard' ||
        currentPath === '/admin/dashboard'
      ) {
        CapApp.exitApp();
        return;
      }

      // Otherwise, navigate back in the application
      if (navigateBack) {
        navigateBack();
      } else if (canGoBack || window.history.length > 1) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch (e) {
    console.debug('BackButton listener failed', e);
  }
};
