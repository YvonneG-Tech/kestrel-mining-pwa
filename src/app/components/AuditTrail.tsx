"use client";
import { useState, useEffect } from "react";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  details?: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
  category: "system" | "user" | "security" | "data" | "compliance";
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  outcome: "success" | "failure" | "warning";
}

interface AuditTrailProps {
  maxEntries?: number;
  autoRefresh?: boolean;
  filters?: {
    categories?: string[];
    severities?: string[];
    users?: string[];
    dateRange?: { start: string; end: string };
  };
}

// Audit logging service
export class AuditLogger {
  private static instance: AuditLogger;
  private entries: AuditLogEntry[] = [];
  private maxEntries = 1000;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>) {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
    };

    this.entries.unshift(logEntry);
    
    // Keep only the latest entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('audit-trail', JSON.stringify(this.entries.slice(0, 100)));
    } catch (error) {
      console.warn('Failed to persist audit trail:', error);
    }

    // In a real application, you would send this to your backend
    console.log('Audit Log:', logEntry);
  }

  getEntries(filters?: AuditTrailProps['filters']): AuditLogEntry[] {
    let filteredEntries = [...this.entries];

    if (filters) {
      if (filters.categories?.length) {
        filteredEntries = filteredEntries.filter(entry => 
          filters.categories!.includes(entry.category)
        );
      }

      if (filters.severities?.length) {
        filteredEntries = filteredEntries.filter(entry =>
          filters.severities!.includes(entry.severity)
        );
      }

      if (filters.users?.length) {
        filteredEntries = filteredEntries.filter(entry =>
          filters.users!.includes(entry.userId)
        );
      }

      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        filteredEntries = filteredEntries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= start && entryDate <= end;
        });
      }
    }

    return filteredEntries;
  }

  private getClientIP(): string {
    // In a real application, you would get this from the server
    return '192.168.1.100';
  }

  // Load entries from localStorage on initialization
  loadPersistedEntries() {
    try {
      const stored = localStorage.getItem('audit-trail');
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load persisted audit trail:', error);
    }

    // Add some sample entries for demonstration
    if (this.entries.length === 0) {
      this.addSampleEntries();
    }
  }

  private addSampleEntries() {
    const sampleEntries: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>[] = [
      {
        userId: "admin1",
        userName: "System Administrator",
        userRole: "Admin",
        action: "LOGIN",
        resource: "Authentication",
        resourceId: "auth-session-001",
        description: "User successfully logged into the system",
        severity: "low",
        category: "security",
        outcome: "success",
      },
      {
        userId: "supervisor1",
        userName: "Site Supervisor",
        userRole: "Supervisor",
        action: "CREATE",
        resource: "Worker",
        resourceId: "EMP005",
        description: "Created new worker profile for John Doe",
        details: { workerName: "John Doe", department: "Mining Operations" },
        severity: "medium",
        category: "data",
        outcome: "success",
      },
      {
        userId: "user1",
        userName: "Safety Officer",
        userRole: "User",
        action: "UPDATE",
        resource: "Document",
        resourceId: "doc-cert-123",
        description: "Updated document status to expired",
        details: { documentName: "Safety Certificate", oldStatus: "valid", newStatus: "expired" },
        severity: "high",
        category: "compliance",
        outcome: "success",
      },
      {
        userId: "system",
        userName: "System Process",
        userRole: "System",
        action: "SCAN",
        resource: "QRCode",
        resourceId: "scan-001",
        description: "Failed QR code scan - worker not found",
        details: { scanLocation: "Main Gate", qrData: "invalid-code" },
        severity: "medium",
        category: "security",
        outcome: "failure",
        location: "Main Gate"
      },
      {
        userId: "admin1",
        userName: "System Administrator",
        userRole: "Admin",
        action: "EXPORT",
        resource: "Document",
        resourceId: "export-001",
        description: "Exported worker documents report",
        details: { reportType: "PDF", documentCount: 25 },
        severity: "low",
        category: "data",
        outcome: "success",
      }
    ];

    sampleEntries.forEach(entry => {
      setTimeout(() => this.log(entry), Math.random() * 1000);
    });
  }
}

export default function AuditTrail({ 
  maxEntries = 50, 
  autoRefresh = true, 
  filters 
}: AuditTrailProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditLogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [currentFilters, setCurrentFilters] = useState(filters || {});

  const auditLogger = AuditLogger.getInstance();

  useEffect(() => {
    // Load persisted entries on mount
    auditLogger.loadPersistedEntries();
    updateEntries();

    // Auto-refresh if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(updateEntries, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, maxEntries]);

  useEffect(() => {
    applyFilters();
  }, [entries, currentFilters]);

  const updateEntries = () => {
    const allEntries = auditLogger.getEntries();
    setEntries(allEntries.slice(0, maxEntries));
  };

  const applyFilters = () => {
    const filtered = auditLogger.getEntries(currentFilters);
    setFilteredEntries(filtered.slice(0, maxEntries));
  };

  const getSeverityBadge = (severity: AuditLogEntry['severity']) => {
    const classes = {
      low: "bg-secondary",
      medium: "bg-info", 
      high: "bg-warning",
      critical: "bg-danger"
    };

    return <span className={`badge ${classes[severity]}`}>{severity.toUpperCase()}</span>;
  };

  const getCategoryIcon = (category: AuditLogEntry['category']) => {
    const icons = {
      system: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon text-info" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <rect x="4" y="4" width="6" height="6" rx="1"/>
          <rect x="4" y="14" width="6" height="6" rx="1"/>
          <rect x="14" y="4" width="6" height="6" rx="1"/>
        </svg>
      ),
      user: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon text-primary" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="4"/>
          <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
        </svg>
      ),
      security: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon text-warning" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>
        </svg>
      ),
      data: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon text-success" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
          <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
        </svg>
      ),
      compliance: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon text-danger" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <polyline points="9,12 12,15 22,6"/>
        </svg>
      )
    };

    return icons[category];
  };

  const getOutcomeIcon = (outcome: AuditLogEntry['outcome']) => {
    switch (outcome) {
      case 'success':
        return <span className="text-success">✓</span>;
      case 'failure':
        return <span className="text-danger">✗</span>;
      case 'warning':
        return <span className="text-warning">⚠</span>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatTimestamp(timestamp);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M22 12c-2 4-4 6-10 6s-8-2-10-6c2-4 4-6 10-6s8 2 10 6"/>
          </svg>
          Audit Trail
        </h3>
        <div className="card-actions">
          <span className="badge bg-primary">{filteredEntries.length} entries</span>
          {autoRefresh && (
            <span className="badge bg-success ms-2">
              <div className="spinner-grow spinner-grow-sm me-1" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Live
            </span>
          )}
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-vcenter">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Location</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    No audit entries found
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className="text-muted small">
                        {getRelativeTime(entry.timestamp)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm me-2 bg-secondary text-white">
                          {entry.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                        <div>
                          <div className="fw-medium">{entry.userName}</div>
                          <div className="text-muted small">{entry.userRole}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {entry.action}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">{entry.resource}</div>
                        <div className="text-muted small">{entry.resourceId}</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {getCategoryIcon(entry.category)}
                        <span className="ms-1 text-capitalize">{entry.category}</span>
                      </div>
                    </td>
                    <td>{getSeverityBadge(entry.severity)}</td>
                    <td>{getOutcomeIcon(entry.outcome)}</td>
                    <td>
                      <span className="text-muted small">
                        {entry.location || entry.ipAddress || '-'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-ghost-secondary"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="modal modal-blur show d-block">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Audit Entry Details</h4>
                <button
                  className="btn-close"
                  onClick={() => setSelectedEntry(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Timestamp</label>
                    <div className="form-control-plaintext">
                      {formatTimestamp(selectedEntry.timestamp)}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Entry ID</label>
                    <div className="form-control-plaintext font-monospace">
                      {selectedEntry.id}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">User</label>
                    <div className="form-control-plaintext">
                      {selectedEntry.userName} ({selectedEntry.userRole})
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Action</label>
                    <div className="form-control-plaintext">
                      <span className="badge bg-primary">{selectedEntry.action}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Resource</label>
                    <div className="form-control-plaintext">
                      {selectedEntry.resource} ({selectedEntry.resourceId})
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category & Severity</label>
                    <div className="form-control-plaintext">
                      <span className="badge bg-light text-dark me-2">
                        {selectedEntry.category.toUpperCase()}
                      </span>
                      {getSeverityBadge(selectedEntry.severity)}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <div className="form-control-plaintext">
                      {selectedEntry.description}
                    </div>
                  </div>
                  {selectedEntry.details && (
                    <div className="col-12">
                      <label className="form-label">Additional Details</label>
                      <div className="form-control-plaintext">
                        <pre className="bg-light p-2 rounded">
                          {JSON.stringify(selectedEntry.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label">IP Address</label>
                    <div className="form-control-plaintext font-monospace">
                      {selectedEntry.ipAddress || 'N/A'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <div className="form-control-plaintext">
                      {selectedEntry.location || 'N/A'}
                    </div>
                  </div>
                  {selectedEntry.userAgent && (
                    <div className="col-12">
                      <label className="form-label">User Agent</label>
                      <div className="form-control-plaintext small text-muted">
                        {selectedEntry.userAgent}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the logger instance for use in other components
export const auditLogger = AuditLogger.getInstance();