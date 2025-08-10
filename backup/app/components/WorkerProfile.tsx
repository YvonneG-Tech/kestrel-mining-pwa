"use client";
import { useState } from "react";
import { WorkerDocument } from "../documents/page";
import DocumentCard from "./DocumentCard";

interface WorkerProfile {
  id: string;
  name: string;
  employeeId: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive" | "pending" | "suspended";
  role: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  lastSeen: string;
  documents?: WorkerDocument[];
  
  // Personal Information
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postcode: string;
  };
  
  // Work Details
  supervisor?: string;
  payrollNumber?: string;
  securityClearance?: string;
  
  // Training & Certifications
  certifications?: {
    id: string;
    name: string;
    issuer: string;
    issuedDate: string;
    expiryDate?: string;
    status: "valid" | "expired" | "expiring";
  }[];
  
  // Performance & Activity
  lastActivity?: {
    type: string;
    description: string;
    timestamp: string;
    location?: string;
  }[];
  
  // Health & Safety
  medicalClearance?: {
    status: "valid" | "expired" | "required";
    expiryDate?: string;
    restrictions?: string[];
  };
  
  incidentHistory?: {
    id: string;
    type: "injury" | "near_miss" | "violation";
    date: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    resolved: boolean;
  }[];
}

interface WorkerProfileProps {
  worker: WorkerProfile;
  onClose: () => void;
  onEdit?: (worker: WorkerProfile) => void;
  onStatusChange?: (workerId: string, status: WorkerProfile["status"]) => void;
}

export default function WorkerProfile({ worker, onClose, onEdit, onStatusChange }: WorkerProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "training" | "activity" | "safety">("overview");

  const getStatusBadge = (status: WorkerProfile["status"]) => {
    const statusClasses = {
      active: "bg-success",
      pending: "bg-warning",
      inactive: "bg-secondary",
      suspended: "bg-danger",
    };

    return (
      <span className={`badge ${statusClasses[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getCertificationStatus = (cert: WorkerProfile["certifications"][0]) => {
    if (!cert.expiryDate) return "valid";
    
    const expiryDate = new Date(cert.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 30) return "expiring";
    return "valid";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short", 
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="modal modal-blur show d-block">
      <div className="modal-dialog modal-full-width modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <div className="d-flex align-items-center">
              <span className="avatar avatar-lg me-3 bg-primary text-white">
                {worker.name.split(" ").map(n => n[0]).join("")}
              </span>
              <div>
                <h4 className="modal-title mb-1">{worker.name}</h4>
                <div className="text-muted">
                  {worker.employeeId} • {worker.role} • {worker.department || "No Department"}
                </div>
              </div>
              <div className="ms-auto">
                {getStatusBadge(worker.status)}
              </div>
            </div>
            <div className="d-flex align-items-center">
              <div className="btn-list me-3">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onEdit?.(worker)}
                >
                  Edit Profile
                </button>
                {onStatusChange && (
                  <div className="dropdown">
                    <button className="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                      Change Status
                    </button>
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={() => onStatusChange(worker.id, "active")}
                      >
                        Mark as Active
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => onStatusChange(worker.id, "inactive")}
                      >
                        Mark as Inactive
                      </button>
                      <button 
                        className="dropdown-item"
                        onClick={() => onStatusChange(worker.id, "suspended")}
                      >
                        Suspend Worker
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="card-tabs">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                  </svg>
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "documents" ? "active" : ""}`}
                  onClick={() => setActiveTab("documents")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                  </svg>
                  Documents ({worker.documents?.length || 0})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "training" ? "active" : ""}`}
                  onClick={() => setActiveTab("training")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M22 9L12 5L2 9l10 4l10 -4v6"/>
                    <path d="M6 10.6V16a6 3 0 0 0 12 0v-5.4"/>
                  </svg>
                  Training & Certifications
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "activity" ? "active" : ""}`}
                  onClick={() => setActiveTab("activity")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                  Activity Log
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "safety" ? "active" : ""}`}
                  onClick={() => setActiveTab("safety")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>
                  </svg>
                  Health & Safety
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className="modal-body" style={{ height: "70vh", overflow: "auto" }}>
            
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Personal Information</h3>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Email</label>
                          <div className="form-control-plaintext">{worker.email || "Not provided"}</div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Phone</label>
                          <div className="form-control-plaintext">{worker.phone || "Not provided"}</div>
                        </div>
                        {worker.dateOfBirth && (
                          <div className="col-md-6">
                            <label className="form-label">Date of Birth</label>
                            <div className="form-control-plaintext">{formatDate(worker.dateOfBirth)}</div>
                          </div>
                        )}
                        {worker.address && (
                          <div className="col-12">
                            <label className="form-label">Address</label>
                            <div className="form-control-plaintext">
                              {worker.address.street}<br />
                              {worker.address.city}, {worker.address.state} {worker.address.postcode}
                            </div>
                          </div>
                        )}
                        {worker.emergencyContact && (
                          <div className="col-12">
                            <label className="form-label">Emergency Contact</label>
                            <div className="form-control-plaintext">
                              {worker.emergencyContact.name} ({worker.emergencyContact.relationship})<br />
                              {worker.emergencyContact.phone}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Work Details</h3>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Start Date</label>
                          <div className="form-control-plaintext">
                            {worker.startDate ? formatDate(worker.startDate) : "Not set"}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Last Seen</label>
                          <div className="form-control-plaintext">{worker.lastSeen}</div>
                        </div>
                        {worker.supervisor && (
                          <div className="col-md-6">
                            <label className="form-label">Supervisor</label>
                            <div className="form-control-plaintext">{worker.supervisor}</div>
                          </div>
                        )}
                        {worker.payrollNumber && (
                          <div className="col-md-6">
                            <label className="form-label">Payroll Number</label>
                            <div className="form-control-plaintext">{worker.payrollNumber}</div>
                          </div>
                        )}
                        {worker.securityClearance && (
                          <div className="col-12">
                            <label className="form-label">Security Clearance</label>
                            <div className="form-control-plaintext">{worker.securityClearance}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div>
                {worker.documents && worker.documents.length > 0 ? (
                  <div className="row row-deck row-cards">
                    {worker.documents.map((document) => (
                      <DocumentCard 
                        key={document.id} 
                        document={document} 
                        onDelete={() => {}} // Handled by parent
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <div className="empty-img">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" width="48" height="48" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                      </svg>
                    </div>
                    <p className="empty-title">No documents found</p>
                    <p className="empty-subtitle text-muted">
                      This worker doesn't have any documents uploaded yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Training & Certifications Tab */}
            {activeTab === "training" && (
              <div>
                {worker.certifications && worker.certifications.length > 0 ? (
                  <div className="row row-deck row-cards">
                    {worker.certifications.map((cert) => {
                      const status = getCertificationStatus(cert);
                      const statusClass = status === "valid" ? "success" : status === "expiring" ? "warning" : "danger";
                      
                      return (
                        <div key={cert.id} className="col-md-6 col-lg-4">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex align-items-center mb-3">
                                <span className="avatar avatar-md me-3 bg-primary text-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="15" cy="15" r="3"/>
                                    <path d="M13 17.5V22l2 -1.5l2 1.5v-4.5"/>
                                    <path d="M10 19H5a2 2 0 0 1 -2 -2V7c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73"/>
                                  </svg>
                                </span>
                                <div className="flex-fill">
                                  <div className="fw-bold">{cert.name}</div>
                                  <div className="text-muted small">{cert.issuer}</div>
                                </div>
                                <span className={`badge bg-${statusClass}`}>
                                  {status.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="row g-2 text-muted small">
                                <div className="col-6">
                                  <div>Issued: {formatDate(cert.issuedDate)}</div>
                                </div>
                                {cert.expiryDate && (
                                  <div className="col-6">
                                    <div>Expires: {formatDate(cert.expiryDate)}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty">
                    <div className="empty-img">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" width="48" height="48" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M22 9L12 5L2 9l10 4l10 -4v6"/>
                        <path d="M6 10.6V16a6 3 0 0 0 12 0v-5.4"/>
                      </svg>
                    </div>
                    <p className="empty-title">No certifications found</p>
                    <p className="empty-subtitle text-muted">
                      This worker doesn't have any training certifications recorded.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === "activity" && (
              <div>
                {worker.lastActivity && worker.lastActivity.length > 0 ? (
                  <div className="timeline">
                    {worker.lastActivity.map((activity, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-time text-muted small">
                            {getTimeAgo(activity.timestamp)}
                            {activity.location && <span className="ms-2">• {activity.location}</span>}
                          </div>
                          <div className="timeline-title fw-bold">{activity.type}</div>
                          <div className="timeline-body text-muted">
                            {activity.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <div className="empty-img">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" width="48" height="48" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                      </svg>
                    </div>
                    <p className="empty-title">No activity recorded</p>
                    <p className="empty-subtitle text-muted">
                      No recent activity found for this worker.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Health & Safety Tab */}
            {activeTab === "safety" && (
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Medical Clearance</h3>
                    </div>
                    <div className="card-body">
                      {worker.medicalClearance ? (
                        <div>
                          <div className="mb-3">
                            <span className={`badge bg-${
                              worker.medicalClearance.status === "valid" ? "success" : 
                              worker.medicalClearance.status === "expired" ? "danger" : "warning"
                            }`}>
                              {worker.medicalClearance.status.toUpperCase()}
                            </span>
                          </div>
                          {worker.medicalClearance.expiryDate && (
                            <div className="mb-3">
                              <small className="text-muted">Expires:</small>
                              <div>{formatDate(worker.medicalClearance.expiryDate)}</div>
                            </div>
                          )}
                          {worker.medicalClearance.restrictions && worker.medicalClearance.restrictions.length > 0 && (
                            <div>
                              <small className="text-muted">Restrictions:</small>
                              <ul className="list-unstyled mt-1">
                                {worker.medicalClearance.restrictions.map((restriction, index) => (
                                  <li key={index} className="text-warning">• {restriction}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted">No medical clearance on file</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Incident History</h3>
                    </div>
                    <div className="card-body">
                      {worker.incidentHistory && worker.incidentHistory.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {worker.incidentHistory.map((incident) => (
                            <div key={incident.id} className="list-group-item px-0">
                              <div className="d-flex align-items-center">
                                <span className={`badge bg-${
                                  incident.severity === "critical" ? "danger" :
                                  incident.severity === "high" ? "warning" :
                                  incident.severity === "medium" ? "info" : "secondary"
                                } me-2`}>
                                  {incident.severity.toUpperCase()}
                                </span>
                                <div className="flex-fill">
                                  <div className="fw-medium">{incident.type.replace("_", " ").toUpperCase()}</div>
                                  <div className="text-muted small">{formatDate(incident.date)}</div>
                                  <div className="small">{incident.description}</div>
                                </div>
                                {incident.resolved && (
                                  <span className="badge bg-success">Resolved</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted">No incidents recorded</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}