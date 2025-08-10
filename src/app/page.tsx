"use client";
import { useState } from "react";
import WorkerCard from "./components/WorkerCard";
import AddWorkerForm from "./components/AddWorkerForm";
import DashboardAnalytics from "./components/DashboardAnalytics";
import AuditTrail from "./components/AuditTrail";
import { Protected } from "./components/RoleBasedAccess";
import { WorkerDocument } from "./documents/page";

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

// Initial sample data
const initialWorkers: Worker[] = [
  {
    id: "1",
    name: "John Smith",
    employeeId: "EMP001",
    status: "active",
    role: "Site Supervisor",
    lastSeen: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    employeeId: "EMP002",
    status: "active",
    role: "Safety Officer",
    lastSeen: "30 minutes ago",
  },
  {
    id: "3",
    name: "Mike Wilson",
    employeeId: "EMP003",
    status: "pending",
    role: "Equipment Operator",
    lastSeen: "1 day ago",
  },
  {
    id: "4",
    name: "Lisa Chen",
    employeeId: "EMP004",
    status: "inactive",
    role: "Training Coordinator",
    lastSeen: "3 days ago",
  },
];

// Sample documents for analytics
const sampleDocuments: WorkerDocument[] = [
  {
    id: "1",
    name: "Mining Safety Certificate.pdf",
    type: "certification",
    file: new File([""], "Mining Safety Certificate.pdf", { type: "application/pdf" }),
    uploadedAt: "2024-01-15T10:30:00Z",
    expiryDate: "2025-01-15",
    workerId: "1",
    workerName: "John Smith",
    status: "valid",
    fileSize: 2048576,
    description: "Annual mining safety certification",
  },
  {
    id: "2", 
    name: "Driver License.jpg",
    type: "id",
    file: new File([""], "Driver License.jpg", { type: "image/jpeg" }),
    uploadedAt: "2024-02-01T14:20:00Z",
    expiryDate: "2024-12-31",
    workerId: "2",
    workerName: "Sarah Johnson",
    status: "expiring",
    fileSize: 1536000,
    description: "Heavy vehicle driver license",
  },
  {
    id: "3",
    name: "First Aid Training.pdf",
    type: "training",
    file: new File([""], "First Aid Training.pdf", { type: "application/pdf" }),
    uploadedAt: "2024-01-20T09:15:00Z",
    expiryDate: "2023-12-31",
    workerId: "3",
    workerName: "Mike Wilson",
    status: "expired",
    fileSize: 3145728,
  },
];

// Sample scan history for analytics
const sampleScanHistory = [
  {
    id: "scan-1",
    timestamp: new Date().toISOString(),
    worker: { name: "John Smith", employeeId: "EMP001" },
    status: "success",
    location: "Main Gate"
  },
  {
    id: "scan-2", 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    worker: { name: "Sarah Johnson", employeeId: "EMP002" },
    status: "success",
    location: "Equipment Yard"
  }
];

export default function Home() {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  const handleAddWorker = (newWorker: Worker) => {
    setWorkers((prevWorkers) => [...prevWorkers, newWorker]);
  };

  // Calculate stats from actual worker data
  const activeWorkers = workers.filter((w) => w.status === "active").length;
  const pendingWorkers = workers.filter((w) => w.status === "pending").length;
  const inactiveWorkers = workers.filter((w) => w.status === "inactive").length;

  return (
    <div className="page-wrapper">
      <div className="container-fluid">
        <div className="page-header d-print-none">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">Kestrel Mining Dashboard</h2>
              <div className="page-subtitle">Workforce Management System</div>
            </div>
            <div className="col-auto ms-auto">
              <div className="btn-list">
                <button
                  className={`btn ${showAnalytics ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setShowAnalytics(!showAnalytics)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                  {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </button>
                <button
                  className={`btn ${showAuditTrail ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setShowAuditTrail(!showAuditTrail)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="2"/>
                    <path d="M22 12c-2 4-4 6-10 6s-8-2-10-6c2-4 4-6 10-6s8 2 10 6"/>
                  </svg>
                  {showAuditTrail ? 'Hide Audit Trail' : 'Show Audit Trail'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Card - Now Dynamic */}
        <div className="row row-deck row-cards mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">System Status</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-4">
                    <div className="text-center">
                      <span className="badge bg-success me-1"></span>
                      <span className="text-success">Active</span>
                      <div className="h1 m-0">{activeWorkers}</div>
                      <div className="text-muted">Active Workers</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center">
                      <span className="badge bg-warning me-1"></span>
                      <span className="text-warning">Pending</span>
                      <div className="h1 m-0">{pendingWorkers}</div>
                      <div className="text-muted">Pending Workers</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center">
                      <span className="badge bg-danger me-1"></span>
                      <span className="text-danger">Inactive</span>
                      <div className="h1 m-0">{inactiveWorkers}</div>
                      <div className="text-muted">Inactive Workers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <Protected resource="reports" action="read">
            <div className="row row-deck row-cards mb-4">
              <div className="col-12">
                <DashboardAnalytics 
                  workers={workers}
                  documents={sampleDocuments}
                  scanHistory={sampleScanHistory}
                />
              </div>
            </div>
          </Protected>
        )}

        {/* Audit Trail */}
        {showAuditTrail && (
          <Protected resource="audit" action="read">
            <div className="row row-deck row-cards mb-4">
              <div className="col-12">
                <AuditTrail 
                  maxEntries={25}
                  autoRefresh={true}
                />
              </div>
            </div>
          </Protected>
        )}

        {/* Add Worker Form */}
        <Protected resource="workers" action="create">
          <div className="row row-deck row-cards">
            <AddWorkerForm onAddWorker={handleAddWorker} />
          </div>
        </Protected>

        {/* Workers Section Header */}
        <div className="row row-deck row-cards">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">All Workers ({workers.length})</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Cards */}
        <div className="row row-deck row-cards">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </div>
    </div>
  );
}
