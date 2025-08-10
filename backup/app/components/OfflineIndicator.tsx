"use client";
import { useState, useEffect } from "react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Show reconnected notification
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_FAILED_REQUESTS'
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100" style={{ zIndex: 1060 }}>
      <div className="alert alert-warning alert-dismissible mb-0 rounded-0 border-0">
        <div className="d-flex align-items-center justify-content-center">
          <div className="me-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon text-warning" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M22 12c-2 4-4 6-10 6s-8-2-10-6c2-4 4-6 10-6s8 2 10 6"/>
              <path d="M22 12c-1.7 3.4-3.5 5.4-8 5.4s-6.3-2-8-5.4"/>
              <path d="M12 12v.01"/>
            </svg>
          </div>
          <div className="flex-fill">
            <strong>You&apos;re offline</strong> - Some features may not work properly. Data will sync when connection is restored.
          </div>
        </div>
      </div>
    </div>
  );
}