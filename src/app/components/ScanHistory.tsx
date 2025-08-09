"use client";
import { useState } from "react";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastSeen: string;
}

interface ScanResult {
  id: string;
  timestamp: string;
  workerData: Record<string, unknown>;
  worker?: Worker;
  status: "success" | "error" | "not_found";
  location?: string;
}

interface ScanHistoryProps {
  scanHistory: ScanResult[];
  onClearHistory: () => void;
}

export default function ScanHistory({ scanHistory, onClearHistory }: ScanHistoryProps) {
  const [filter, setFilter] = useState<"all" | "success" | "error" | "not_found">("all");
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredHistory = scanHistory.filter(scan => 
    filter === "all" || scan.status === filter
  );

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadge = (status: ScanResult["status"]) => {
    const badgeClasses = {
      success: "bg-success",
      error: "bg-danger",
      not_found: "bg-warning",
    };

    const labels = {
      success: "Success",
      error: "Error",
      not_found: "Not Found",
    };

    return (
      <span className={`badge ${badgeClasses[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getStatusIcon = (status: ScanResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-success" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <path d="M9 12l2 2l4 -4"/>
          </svg>
        );
      case "not_found":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-warning" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <path d="M9 9l6 6"/>
            <path d="M15 9l-6 6"/>
          </svg>
        );
      case "error":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-danger" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10.29 3.86l-1.82 16.3a.5 .5 0 0 0 .47 .54h6.06a.5 .5 0 0 0 .47 -.54l-1.82 -16.3a.5 .5 0 0 0 -.47 -.46h-2.36a.5 .5 0 0 0 -.47 .46z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const headers = ["Timestamp", "Status", "Worker Name", "Employee ID", "Location", "QR Data"];
    const rows = scanHistory.map(scan => [
      new Date(scan.timestamp).toISOString(),
      scan.status,
      scan.worker?.name || "N/A",
      scan.worker?.employeeId || "N/A",
      scan.location || "N/A",
      JSON.stringify(scan.workerData)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `scan-history-${new Date().toISOString().split('T')[0]}.csv`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Scan History ({filteredHistory.length})</h3>
        <div className="card-actions">
          <div className="me-3">
            <select
              className="form-select form-select-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">All Scans</option>
              <option value="success">Successful</option>
              <option value="not_found">Not Found</option>
              <option value="error">Errors</option>
            </select>
          </div>
          
          {scanHistory.length > 0 && (
            <>
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={exportToCSV}
                title="Export to CSV"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                  <path d="M12 11v6"/>
                  <path d="M9.5 13.5l2.5 -2.5l2.5 2.5"/>
                </svg>
                Export
              </button>
              
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={onClearHistory}
                title="Clear all history"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <line x1="4" y1="7" x2="20" y2="7"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
                </svg>
                Clear
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="card-body p-0">
        {filteredHistory.length === 0 ? (
          <div className="empty p-5">
            <div className="empty-img">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <circle cx="12" cy="12" r="2"/>
                <path d="M22 12c-2 4-4 6-10 6s-8-2-10-6c2-4 4-6 10-6s8 2 10 6"/>
              </svg>
            </div>
            <p className="empty-title">No scan history</p>
            <p className="empty-subtitle text-muted">
              {filter === "all" 
                ? "Start scanning QR codes to see history here"
                : `No ${filter} scans found`}
            </p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {filteredHistory.map((scan) => (
              <div key={scan.id} className="list-group-item">
                <div className="row align-items-center">
                  <div className="col-auto">
                    {getStatusIcon(scan.status)}
                  </div>
                  
                  <div className="col text-truncate">
                    <div className="d-flex align-items-center">
                      {scan.worker ? (
                        <>
                          <span className="fw-bold me-2">{scan.worker.name}</span>
                          <span className="text-muted small">({scan.worker.employeeId})</span>
                        </>
                      ) : (
                        <span className="text-muted">Unknown Worker</span>
                      )}
                    </div>
                    <div className="text-muted small">
                      {formatDateTime(scan.timestamp)}
                      {scan.location && ` • ${scan.location}`}
                    </div>
                  </div>
                  
                  <div className="col-auto">
                    {getStatusBadge(scan.status)}
                  </div>
                  
                  <div className="col-auto">
                    <button
                      className="btn btn-sm btn-ghost-secondary"
                      onClick={() => setShowDetails(
                        showDetails === scan.id ? null : scan.id
                      )}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M6 9l6 6l6 -6"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {showDetails === scan.id && (
                  <div className="mt-3 pt-3 border-top">
                    <div className="row g-3">
                      {scan.worker && (
                        <div className="col-md-6">
                          <h6>Worker Details</h6>
                          <div className="small">
                            <div><strong>Role:</strong> {scan.worker.role}</div>
                            <div><strong>Status:</strong> 
                              <span className={`badge badge-sm ms-1 ${
                                scan.worker.status === "active" ? "bg-success" : 
                                scan.worker.status === "pending" ? "bg-warning" : "bg-danger"
                              }`}>
                                {scan.worker.status}
                              </span>
                            </div>
                            <div><strong>Last Seen:</strong> {scan.worker.lastSeen}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="col-md-6">
                        <h6>Scan Details</h6>
                        <div className="small">
                          <div><strong>Timestamp:</strong> {new Date(scan.timestamp).toLocaleString()}</div>
                          {scan.location && <div><strong>Location:</strong> {scan.location}</div>}
                          <div><strong>Status:</strong> {getStatusBadge(scan.status)}</div>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <h6>QR Code Data</h6>
                        <pre className="bg-light p-2 rounded small" style={{ fontSize: "0.75rem" }}>
                          {JSON.stringify(scan.workerData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}