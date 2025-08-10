"use client";
import { useState } from "react";
import { WorkerDocument } from "../documents/page";

interface DocumentViewerProps {
  document: WorkerDocument;
  onClose: () => void;
}

export default function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Create object URL for file preview
  React.useEffect(() => {
    try {
      const url = URL.createObjectURL(document.file);
      setFileUrl(url);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load document preview");
      setIsLoading(false);
    }

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [document.file]);

  const isImage = document.file.type.startsWith('image/');
  const isPDF = document.file.type === 'application/pdf';
  const isOfficeDoc = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ].includes(document.file.type);

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
      hour: "2-digit",
      minute: "2-digit",
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

  const handleDownload = () => {
    if (!fileUrl) return;
    
    const link = window.document.createElement('a');
    link.href = fileUrl;
    link.download = document.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!fileUrl) return;
    
    const printWindow = window.open(fileUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="modal modal-blur show d-block">
      <div className="modal-dialog modal-full-width modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <div className="fw-bold">{document.name}</div>
                <div className="text-muted small">
                  {document.workerName && `${document.workerName} • `}
                  {document.type.toUpperCase()} • {formatFileSize(document.fileSize)}
                </div>
              </div>
              {getStatusBadge()}
            </div>
            <div className="d-flex align-items-center">
              <div className="btn-list me-3">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleDownload}
                  disabled={!fileUrl}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/>
                    <polyline points="7,11 12,16 17,11"/>
                    <line x1="12" y1="4" x2="12" y2="16"/>
                  </svg>
                  Download
                </button>
                {(isImage || isPDF) && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handlePrint}
                    disabled={!fileUrl}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <polyline points="6,9 6,2 18,2 18,9"/>
                      <path d="M6 18H4a2 2 0 0 1 -2 -2v-5a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2h-2"/>
                      <rect x="6" y="14" width="12" height="8" rx="1"/>
                    </svg>
                    Print
                  </button>
                )}
              </div>
              <button
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
          </div>

          <div className="modal-body p-0" style={{ height: "80vh", overflow: "hidden" }}>
            {isLoading && (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <div className="empty-img mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg text-danger" width="48" height="48" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <circle cx="12" cy="12" r="9"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <h4 className="text-danger">Preview Error</h4>
                  <p className="text-muted">{error}</p>
                  <button className="btn btn-primary" onClick={handleDownload}>
                    Download Document
                  </button>
                </div>
              </div>
            )}

            {!isLoading && !error && fileUrl && (
              <>
                {/* Image Preview */}
                {isImage && (
                  <div className="d-flex align-items-center justify-content-center h-100 p-3">
                    <img
                      src={fileUrl}
                      alt={document.name}
                      className="img-fluid"
                      style={{ 
                        maxHeight: "100%", 
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "8px"
                      }}
                    />
                  </div>
                )}

                {/* PDF Preview */}
                {isPDF && (
                  <iframe
                    src={fileUrl}
                    className="w-100 h-100 border-0"
                    title={document.name}
                  />
                )}

                {/* Office Document Preview */}
                {isOfficeDoc && (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center">
                      <div className="empty-img mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg text-primary" width="64" height="64" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                          <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                          <line x1="9" y1="9" x2="10" y2="9"/>
                          <line x1="9" y1="13" x2="15" y2="13"/>
                          <line x1="9" y1="17" x2="15" y2="17"/>
                        </svg>
                      </div>
                      <h4>Office Document</h4>
                      <p className="text-muted mb-3">
                        Preview not available for Office documents.
                        <br />
                        Download the file to view its contents.
                      </p>
                      <button className="btn btn-primary" onClick={handleDownload}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/>
                          <polyline points="7,11 12,16 17,11"/>
                          <line x1="12" y1="4" x2="12" y2="16"/>
                        </svg>
                        Download Document
                      </button>
                    </div>
                  </div>
                )}

                {/* Unsupported File Type */}
                {!isImage && !isPDF && !isOfficeDoc && (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center">
                      <div className="empty-img mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg text-secondary" width="64" height="64" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                          <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                        </svg>
                      </div>
                      <h4>File Preview</h4>
                      <p className="text-muted mb-3">
                        Preview not available for this file type.
                        <br />
                        Download the file to view its contents.
                      </p>
                      <button className="btn btn-primary" onClick={handleDownload}>
                        Download Document
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Document Details Footer */}
          <div className="modal-footer bg-light">
            <div className="row w-100 g-3 text-start">
              <div className="col-md-3">
                <small className="text-muted">Uploaded</small>
                <div className="fw-medium">{formatDate(document.uploadedAt)}</div>
              </div>
              {document.expiryDate && (
                <div className="col-md-3">
                  <small className="text-muted">Expires</small>
                  <div className="fw-medium">{formatDate(document.expiryDate)}</div>
                </div>
              )}
              {document.description && (
                <div className="col-md-6">
                  <small className="text-muted">Description</small>
                  <div className="fw-medium">{document.description}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}