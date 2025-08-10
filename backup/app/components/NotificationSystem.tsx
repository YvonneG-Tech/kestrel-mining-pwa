"use client";
import { useState, useEffect } from "react";
import { WorkerDocument } from "../documents/page";

interface Notification {
  id: string;
  type: "expiry" | "expired" | "success" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  documentId?: string;
  autoRemove?: boolean;
}

interface NotificationSystemProps {
  documents: WorkerDocument[];
}

export default function NotificationSystem({ documents }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check for expiring/expired documents
  useEffect(() => {
    const checkDocuments = () => {
      const now = new Date();
      const newNotifications: Notification[] = [];

      documents.forEach(doc => {
        if (!doc.expiryDate) return;

        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Document expired
        if (daysUntilExpiry < 0 && doc.status !== 'expired') {
          newNotifications.push({
            id: `expired-${doc.id}-${Date.now()}`,
            type: "expired",
            title: "Document Expired",
            message: `${doc.name} for ${doc.workerName || 'Unassigned'} expired ${Math.abs(daysUntilExpiry)} days ago`,
            timestamp: now,
            documentId: doc.id,
            autoRemove: false,
          });
        }
        // Document expiring soon (within 30 days)
        else if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && doc.status !== 'expiring') {
          newNotifications.push({
            id: `expiring-${doc.id}-${Date.now()}`,
            type: "expiry",
            title: "Document Expiring Soon",
            message: `${doc.name} for ${doc.workerName || 'Unassigned'} expires in ${daysUntilExpiry} days`,
            timestamp: now,
            documentId: doc.id,
            autoRemove: false,
          });
        }
      });

      // Only add notifications that don't already exist
      const existingDocumentIds = new Set(notifications.map(n => n.documentId));
      const uniqueNotifications = newNotifications.filter(n => 
        !existingDocumentIds.has(n.documentId)
      );

      if (uniqueNotifications.length > 0) {
        setNotifications(prev => [...uniqueNotifications, ...prev].slice(0, 50)); // Keep last 50
      }
    };

    checkDocuments();
    
    // Check every hour
    const interval = setInterval(checkDocuments, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [documents, notifications]);

  // Auto-remove notifications after delay
  useEffect(() => {
    const autoRemoveTimers = notifications
      .filter(n => n.autoRemove)
      .map(notification => 
        setTimeout(() => {
          removeNotification(notification.id);
        }, 5000)
      );

    return () => {
      autoRemoveTimers.forEach(clearTimeout);
    };
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'expired':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-danger" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
      case 'expiry':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-warning" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        );
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-success" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <polyline points="9,12 12,15 22,6"/>
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-warning" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-info" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const urgentNotifications = notifications.filter(n => n.type === 'expired' || n.type === 'expiry');

  return (
    <>
      {/* Notification Bell */}
      <div className="dropdown">
        <button
          className="btn btn-outline-secondary position-relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/>
            <path d="M9 17v1a3 3 0 0 0 6 0v-1"/>
          </svg>
          
          {notifications.length > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {notifications.length > 99 ? '99+' : notifications.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="dropdown-menu dropdown-menu-end show" style={{ width: '400px', maxHeight: '500px', overflowY: 'auto' }}>
            <div className="dropdown-header d-flex justify-content-between align-items-center">
              <span>Notifications ({notifications.length})</span>
              {notifications.length > 0 && (
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={markAllAsRead}
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="dropdown-item-text text-center text-muted py-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg mb-2" width="32" height="32" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/>
                  <path d="M9 17v1a3 3 0 0 0 6 0v-1"/>
                </svg>
                <div>No notifications</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="dropdown-item">
                  <div className="d-flex">
                    <div className="me-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-fill">
                      <div className="fw-medium">{notification.title}</div>
                      <div className="text-muted small">{notification.message}</div>
                      <div className="text-muted small mt-1">{getTimeAgo(notification.timestamp)}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() => removeNotification(notification.id)}
                      style={{ height: 'fit-content' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Backdrop */}
        {showNotifications && (
          <div
            className="dropdown-backdrop"
            onClick={() => setShowNotifications(false)}
          />
        )}
      </div>

      {/* Floating Urgent Notifications */}
      {urgentNotifications.slice(0, 3).map((notification) => (
        <div 
          key={`floating-${notification.id}`}
          className={`position-fixed alert alert-${notification.type === 'expired' ? 'danger' : 'warning'} alert-dismissible`}
          style={{
            top: `${20 + urgentNotifications.indexOf(notification) * 80}px`,
            right: '20px',
            zIndex: 1055,
            minWidth: '350px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div className="d-flex">
            <div className="me-2">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-fill">
              <h4 className="alert-title">{notification.title}</h4>
              <div className="text-muted">{notification.message}</div>
            </div>
          </div>
          <button
            className="btn-close"
            onClick={() => removeNotification(notification.id)}
          ></button>
        </div>
      ))}
    </>
  );

  // Export the addNotification function for external use
  (window as any).addNotification = addNotification;
}