"use client";
import QRCode from "react-qr-code";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastSeen: string;
}

interface MinePassProps {
  worker: Worker;
  onClose: () => void;
}

export default function MinePass({ worker, onClose }: MinePassProps) {
  const qrData = {
    id: worker.id,
    name: worker.name,
    employeeId: worker.employeeId,
    status: worker.status,
    timestamp: Date.now(),
  };

  const statusClass =
    {
      active: "bg-success",
      pending: "bg-warning",
      inactive: "bg-danger",
    }[worker.status] || "bg-secondary";

  return (
    <div className="modal modal-blur fade show d-block">
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Mine Pass</h4>
            <button
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body text-center">
            <div className="avatar avatar-xl mb-3 mx-auto bg-blue text-white">
              {worker.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <h3 className="mb-1">{worker.name}</h3>
            <div className="text-muted mb-3">
              ID: {worker.employeeId} • {worker.role}
            </div>
            <span className={`badge ${statusClass} mb-4`}>
              {worker.status.toUpperCase()}
            </span>
            <div className="card">
              <div className="card-body p-3">
                <QRCode value={JSON.stringify(qrData)} size={160} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary w-100" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
