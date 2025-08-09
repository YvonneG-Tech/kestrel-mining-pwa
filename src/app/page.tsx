"use client";
import { useState } from "react";
import WorkerCard from "./components/WorkerCard";
import AddWorkerForm from "./components/AddWorkerForm";

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

export default function Home() {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);

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

        {/* Add Worker Form */}
        <div className="row row-deck row-cards">
          <AddWorkerForm onAddWorker={handleAddWorker} />
        </div>

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
