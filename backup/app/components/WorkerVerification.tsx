"use client";
import { useState } from "react";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastSeen: string;
  documents?: WorkerDocument[];
}

interface WorkerDocument {
  id: string;
  name: string;
  type: "id" | "certification" | "training" | "medical" | "other";
  status: "valid" | "expiring" | "expired";
  expiryDate?: string;
}

interface ScanResult {
  id: string;
  timestamp: string;
  workerData: Record<string, unknown>;
  worker?: Worker;
  status: "success" | "error" | "not_found";
  location?: string;
}

interface WorkerVerificationProps {
  scanResult: ScanResult;
  onClear: () => void;
  onRescan: () => void;
}

export default function WorkerVerification({
  scanResult,
  onClear,
  onRescan,
}: WorkerVerificationProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    switch (scanResult.status) {
      case "success":
        return scanResult.worker?.status === "active" ? "success" : "warning";
      case "not_found":
        return "warning";
      case "error":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = () => {
    switch (scanResult.status) {
      case "success":
        return scanResult.worker?.status === "active" ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <path d="M9 12l2 2l4 -4"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
      case "not_found":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9"/>
            <path d="M9 9l6 6"/>
            <path d="M15 9l-6 6"/>
          </svg>
        );
      case "error":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
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

  const getVerificationMessage = () => {
    switch (scanResult.status) {
      case "success":
        return scanResult.worker?.status === "active" 
          ? "Access Granted"
          : `Worker Status: ${scanResult.worker?.status?.toUpperCase()}`;
      case "not_found":
        return "Worker Not Found";
      case "error":
        return "Invalid QR Code";
      default:
        return "Unknown Status";
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getDocumentWarnings = (worker: Worker) => {
    if (!worker.documents) return [];
    
    const warnings = [];
    const expiredDocs = worker.documents.filter(doc => doc.status === "expired");
    const expiringDocs = worker.documents.filter(doc => doc.status === "expiring");
    
    if (expiredDocs.length > 0) {
      warnings.push({
        type: "danger" as const,
        message: `${expiredDocs.length} document${expiredDocs.length > 1 ? 's' : ''} expired`,
        docs: expiredDocs
      });
    }
    
    if (expiringDocs.length > 0) {
      warnings.push({
        type: "warning" as const,
        message: `${expiringDocs.length} document${expiringDocs.length > 1 ? 's' : ''} expiring soon`,
        docs: expiringDocs
      });
    }
    
    return warnings;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Verification Result</h3>
        <div className="card-actions">
          <button 
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={onClear}
          >
            Clear
          </button>
          <button 
            className="btn btn-sm btn-primary"
            onClick={onRescan}
          >
            Scan Again
          </button>
        </div>
      </div>
      
      <div className="card-body">
        {/* Status Badge */}
        <div className="text-center mb-4">
          <div className={`avatar avatar-xl mb-3 bg-${getStatusColor()} text-white`}>
            {getStatusIcon()}
          </div>
          <h3 className={`text-${getStatusColor()}`}>
            {getVerificationMessage()}
          </h3>
          <small className="text-muted">
            {formatDateTime(scanResult.timestamp)}
          </small>
        </div>

        {/* Worker Details */}
        {scanResult.worker && (
          <div className="mb-4">
            <div className="row g-2">
              <div className="col-12">
                <div className="d-flex align-items-center mb-2">
                  <span className="avatar avatar-md me-3 bg-secondary text-white">
                    {scanResult.worker.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div className="flex-fill">
                    <div className="fw-bold">{scanResult.worker.name}</div>
                    <div className="text-muted small">
                      ID: {scanResult.worker.employeeId}
                    </div>
                  </div>
                  <span className={`badge bg-${
                    scanResult.worker.status === "active" ? "success" : 
                    scanResult.worker.status === "pending" ? "warning" : "danger"
                  }`}>
                    {scanResult.worker.status}
                  </span>
                </div>
              </div>
              <div className="col-6">
                <small className="text-muted">Role</small>
                <div>{scanResult.worker.role}</div>
              </div>
              <div className="col-6">
                <small className="text-muted">Last Seen</small>
                <div>{scanResult.worker.lastSeen}</div>
              </div>
              {scanResult.location && (
                <div className="col-6">
                  <small className="text-muted">Location</small>
                  <div>{scanResult.location}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Warnings */}
        {scanResult.worker && getDocumentWarnings(scanResult.worker).map((warning, index) => (
          <div key={index} className={`alert alert-${warning.type} mb-3`}>
            <div className="d-flex">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="12" cy="12" r="9"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h4 className="alert-title">Document Alert</h4>
                <div className="text-muted">{warning.message}</div>
                <div className="mt-2">
                  {warning.docs.map(doc => (
                    <span key={doc.id} className="badge bg-light text-dark me-1">
                      {doc.type.toUpperCase()}: {doc.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* QR Code Data (for debugging) */}
        <div className="mt-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Show"} QR Data
          </button>
          
          {showDetails && (
            <div className="mt-2">
              <pre className="bg-light p-2 rounded small">
                {JSON.stringify(scanResult.workerData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Action Recommendations */}
        {scanResult.status === "not_found" && (
          <div className="mt-3">
            <h5>Recommended Actions:</h5>
            <ul className="list-unstyled">
              <li className="mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-2" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="12" cy="12" r="1"/>
                  <path d="M12 12v-9a4 4 0 0 1 4 4v5"/>
                </svg>
                Verify worker registration
              </li>
              <li className="mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-2" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="12" cy="12" r="1"/>
                  <path d="M12 12v-9a4 4 0 0 1 4 4v5"/>
                </svg>
                Check with site supervisor
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-2" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="12" cy="12" r="1"/>
                  <path d="M12 12v-9a4 4 0 0 1 4 4v5"/>
                </svg>
                Request new mine pass
              </li>
            </ul>
          </div>
        )}

        {scanResult.worker?.status !== "active" && scanResult.status === "success" && (
          <div className="mt-3">
            <h5>Access Restrictions:</h5>
            <ul className="list-unstyled">
              <li className="mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-2 text-warning" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="12" cy="12" r="9"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Limited site access
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-2 text-warning" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="12" cy="12" r="9"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Contact HR for status update
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}