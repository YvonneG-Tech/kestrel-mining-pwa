"use client";
import { useState } from "react";
import { WorkerDocument } from "../documents/page";

interface DocumentCardProps {
  document: WorkerDocument;
  onDelete: (documentId: string) => void;
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    const statusClasses = {
      valid: "bg-success",
      expiring: "bg-warning", 
      expired: "bg-danger",
    };

    return (
      <span className={`badge ${statusClasses[document.status]}`}>
        {document.status.toUpperCase()}
      </span>
    );
  };

  const getTypeIcon = () => {
    const icons = {
      id: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <rect x="3" y="4" width="18" height="16" rx="3"/>
          <circle cx="9" cy="10" r="2"/>
          <path d="M15 8l2 0"/>
          <path d="M15 12l2 0"/>
          <path d="M7 16l2 0"/>
        </svg>
      ),
      certification: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <circle cx="15" cy="15" r="3"/>
          <path d="M13 17.5V22l2 -1.5l2 1.5v-4.5"/>
          <path d="M10 19H5a2 2 0 0 1 -2 -2V7c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73"/>
          <line x1="6" y1="9" x2="18" y2="9"/>
          <line x1="6" y1="12" x2="9" y2="12"/>
          <line x1="6" y1="15" x2="8" y2="15"/>
        </svg>
      ),
      training: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M22 9L12 5L2 9l10 4l10 -4v6"/>
          <path d="M6 10.6V16a6 3 0 0 0 12 0v-5.4"/>
        </svg>
      ),
      medical: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21L12 17.77L5.82 21L7 14.14L2 9.27l6.91 -1.01L12 2z"/>
          <path d="M12 6v6"/>
          <path d="M9 9h6"/>
        </svg>
      ),
      other: (
        <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
          <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
        </svg>
      ),
    };

    return icons[document.type];
  };

  const getExpiryWarning = () => {
    if (!document.expiryDate) return null;
    
    const expiryDate = new Date(document.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    } else if (daysUntilExpiry <= 30) {
      return `Expires in ${daysUntilExpiry} days`;
    }
    return null;
  };

  const handleDownload = () => {
    // Create a download link for the file
    const url = URL.createObjectURL(document.file);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <span className="avatar avatar-md me-3 bg-primary text-white">
                {getTypeIcon()}
              </span>
              <div className="flex-fill">
                <div className="fw-bold" title={document.name}>
                  {document.name.length > 20 
                    ? document.name.substring(0, 20) + "..."
                    : document.name
                  }
                </div>
                <div className="text-muted small">
                  {document.workerName && `${document.workerName} • `}
                  {document.type.toUpperCase()}
                </div>
              </div>
              {getStatusBadge()}
            </div>

            {/* Expiry Warning */}
            {getExpiryWarning() && (
              <div className={`alert alert-${document.status === 'expired' ? 'danger' : 'warning'} alert-dismissible mb-3`}>
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
                    <small>{getExpiryWarning()}</small>
                  </div>
                </div>
              </div>
            )}

            <div className="btn-list">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Hide" : "Details"}
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleDownload}
              >
                Download
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-top">
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted">File Size</small>
                    <div>{formatFileSize(document.fileSize)}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Uploaded</small>
                    <div>{formatDate(document.uploadedAt)}</div>
                  </div>
                  {document.expiryDate && (
                    <div className="col-6">
                      <small className="text-muted">Expires</small>
                      <div>{formatDate(document.expiryDate)}</div>
                    </div>
                  )}
                  {document.description && (
                    <div className="col-12 mt-2">
                      <small className="text-muted">Description</small>
                      <div>{document.description}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal modal-blur show d-block">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Delete Document</h4>
                <button
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowDeleteConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this document?</p>
                <p className="text-muted">
                  <strong>{document.name}</strong>
                  <br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(document.id);
                    setShowDeleteConfirm(false);
                  }}
                >
                  Delete Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}