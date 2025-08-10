"use client";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone ||
                           document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Hide install prompt after app is installed
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Hide for 24 hours
    localStorage.setItem('pwa-install-dismissed', new Date().getTime().toString());
  };

  const showUpdateNotification = () => {
    // You could integrate this with your notification system
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Kestrel Mining Update Available', {
        body: 'A new version of the app is available. Refresh to update.',
        icon: '/icons/icon-192.png',
        tag: 'app-update'
      });
    }
  };

  // Check if we should show install prompt
  const shouldShowInstall = showInstallPrompt && 
                          !isStandalone && 
                          deferredPrompt &&
                          !localStorage.getItem('pwa-install-dismissed');

  if (!shouldShowInstall) return null;

  return (
    <div className="position-fixed bottom-0 start-50 translate-middle-x mb-3" style={{ zIndex: 1050 }}>
      <div className="alert alert-info alert-dismissible shadow-lg" style={{ maxWidth: '350px' }}>
        <div className="d-flex">
          <div className="me-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon text-info" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M7 4v16h10v-16z"/>
              <path d="M7 6h10"/>
              <path d="M7 14h10"/>
              <circle cx="12" cy="10.5" r="1.5"/>
            </svg>
          </div>
          <div className="flex-fill">
            <h4 className="alert-title">Install Kestrel Mining</h4>
            <div className="text-muted">Get faster access and work offline by installing the app.</div>
            <div className="btn-list mt-3">
              <button 
                className="btn btn-info btn-sm"
                onClick={handleInstallClick}
              >
                Install App
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={dismissInstallPrompt}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
        <button
          className="btn-close"
          onClick={dismissInstallPrompt}
        ></button>
      </div>
    </div>
  );
}