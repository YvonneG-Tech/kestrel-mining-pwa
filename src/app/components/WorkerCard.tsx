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

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (worker.status) {
      case "active":
        return "bg-success";
      case "inactive":
        return "bg-danger";
      case "pending":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="col-md-6 col-lg-4">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <span className="avatar avatar-md me-3 bg-secondary text-white">
              {worker.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div className="flex-fill">
              <div className="font-weight-medium">{worker.name}</div>
              <div className="text-muted">ID: {worker.employeeId}</div>
            </div>
            <span className={`badge ${getStatusBadge()}`}>{worker.status}</span>
          </div>

          <div className="mt-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Hide Details" : "View Details"}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-3 pt-3 border-top">
              <div className="row">
                <div className="col-6">
                  <div className="text-muted">Role</div>
                  <div>{worker.role}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Last Seen</div>
                  <div>{worker.lastSeen}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
