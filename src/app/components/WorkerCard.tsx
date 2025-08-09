"use client";
import { useState } from "react";
import MinePass from "./MinePass";

interface WorkerDocument {
  id: string;
  name: string;
  type: "id" | "certification" | "training" | "medical" | "other";
  file: File;
  uploadedAt: string;
}

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastSeen: string;
  documents?: WorkerDocument[];
}

export default function WorkerCard({ worker }: { worker: Worker }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMinePass, setShowMinePass] = useState(false);

  const statusClass = {
    active: "bg-success",
    pending: "bg-warning",
    inactive: "bg-danger",
  }[worker.status];

  return (
    <>
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <span className="avatar avatar-md me-3 bg-secondary text-white">
                {worker.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div className="flex-fill">
                <div className="fw-bold">{worker.name}</div>
                <div className="text-muted small">ID: {worker.employeeId}</div>
              </div>
              <span className={`badge ${statusClass}`}>{worker.status}</span>
            </div>

            {/* Document Summary */}
            {worker.documents && worker.documents.length > 0 && (
              <div className="mb-3">
                <div className="d-flex align-items-center text-muted small">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                  </svg>
                  <span>{worker.documents.length} document{worker.documents.length !== 1 ? 's' : ''}</span>
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
                onClick={() => setShowMinePass(true)}
              >
                QR Pass
              </button>
              {worker.documents && worker.documents.length > 0 && (
                <a
                  href={`/documents?worker=${worker.id}`}
                  className="btn btn-sm btn-outline-secondary"
                  title="View documents"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                  </svg>
                </a>
              )}
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-top">
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted">Role</small>
                    <div>{worker.role}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Last Seen</small>
                    <div>{worker.lastSeen}</div>
                  </div>
                  {worker.documents && worker.documents.length > 0 && (
                    <div className="col-12 mt-3">
                      <small className="text-muted">Documents ({worker.documents.length})</small>
                      <div className="mt-2">
                        {worker.documents.map((doc) => (
                          <span key={doc.id} className="badge bg-light text-dark me-1 mb-1">
                            {doc.type.toUpperCase()}: {doc.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMinePass && (
        <MinePass worker={worker} onClose={() => setShowMinePass(false)} />
      )}
    </>
  );
}
