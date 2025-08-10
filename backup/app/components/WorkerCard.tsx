"use client";
import { useState } from "react";
import MinePass from "./MinePass";
import WorkerProfile from "./WorkerProfile";

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
  const [showProfile, setShowProfile] = useState(false);

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

            <div className="btn-list">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowProfile(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                </svg>
                Profile
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Hide" : "Details"}
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowMinePass(true)}
              >
                QR Pass
              </button>
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

      {showProfile && (
        <WorkerProfile 
          worker={{
            ...worker,
            email: `${worker.name.toLowerCase().replace(' ', '.')}@kestrelmining.com`,
            phone: "+61 4XX XXX XXX",
            dateOfBirth: "1985-03-15",
            address: {
              street: "123 Mining Road",
              city: "Perth",
              state: "WA", 
              postcode: "6000"
            },
            emergencyContact: {
              name: "Emergency Contact",
              relationship: "Spouse",
              phone: "+61 4XX XXX XXX"
            },
            supervisor: "Site Manager",
            payrollNumber: `PAY${worker.employeeId}`,
            certifications: [
              {
                id: "cert-1",
                name: "Mining Safety Induction",
                issuer: "Department of Mines",
                issuedDate: "2024-01-15",
                expiryDate: "2025-01-15",
                status: "valid" as const
              },
              {
                id: "cert-2", 
                name: "First Aid Certificate",
                issuer: "Red Cross",
                issuedDate: "2023-06-20",
                expiryDate: "2024-06-20",
                status: "expiring" as const
              }
            ],
            lastActivity: [
              {
                type: "Site Entry",
                description: "Entered main gate with valid access card",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                location: "Main Gate"
              },
              {
                type: "Equipment Check",
                description: "Completed pre-shift equipment inspection",
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                location: "Equipment Yard"
              }
            ],
            medicalClearance: {
              status: "valid" as const,
              expiryDate: "2025-03-01"
            }
          }}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}
