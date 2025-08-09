"use client";
import { useState } from "react";
import MinePass from "./MinePass";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastSeen: string;
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
