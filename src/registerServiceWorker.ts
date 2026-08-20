/**
 * HanssonHub PWA Service Worker Registration & Install Management
 */

let deferredInstallPrompt: any = null;
let isInstallable = false;

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register when window loads to avoid blocking page load
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered with scope:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update().catch((err) => {
            console.warn('[PWA] Service Worker background update check error:', err);
          });
        }, 60 * 60 * 1000); // every 1 hour

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('[PWA] New version of HanssonHub available!');
                // Dispatch event so UI can show update notification if desired
                window.dispatchEvent(new CustomEvent('pwa-update-available', {
                  detail: { registration }
                }));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });

    // Capture PWA beforeinstallprompt event for Android / Desktop Chrome / Edge
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent browser mini-infobar default on mobile
      e.preventDefault();
      deferredInstallPrompt = e;
      isInstallable = true;
      console.log('[PWA] beforeinstallprompt captured, application is installable!');
      
      // Notify components that HanssonHub is installable
      window.dispatchEvent(new CustomEvent('pwa-installable', {
        detail: { isInstallable: true }
      }));
    });

    // Detect when successfully installed
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] HanssonHub successfully installed as standalone application');
      deferredInstallPrompt = null;
      isInstallable = false;
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  });
}

/**
 * Check if the application is running in standalone PWA mode
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Trigger the native browser PWA installation dialog
 */
export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) {
    console.log('[PWA] No deferred install prompt available');
    return false;
  }

  try {
    await deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log('[PWA] User response to install prompt:', outcome);
    deferredInstallPrompt = null;
    isInstallable = false;
    return outcome === 'accepted';
  } catch (err) {
    console.warn('[PWA] Install prompt failed:', err);
    return false;
  }
}

/**
 * Check if installation prompt is currently ready
 */
export function canInstallPWA(): boolean {
  return isInstallable && !!deferredInstallPrompt;
}
