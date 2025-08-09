"use client";
import { useState } from "react";
import WorkerCard from "../components/WorkerCard";
import AddWorkerForm from "../components/AddWorkerForm";

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

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all");

  const handleAddWorker = (newWorker: Worker) => {
    setWorkers((prevWorkers) => [...prevWorkers, newWorker]);
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || worker.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from filtered workers
  const activeWorkers = filteredWorkers.filter((w) => w.status === "active").length;
  const pendingWorkers = filteredWorkers.filter((w) => w.status === "pending").length;
  const inactiveWorkers = filteredWorkers.filter((w) => w.status === "inactive").length;

  return (
    <div className="page-wrapper">
      <div className="container-fluid">
        <div className="page-header d-print-none">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">Workers Management</h2>
              <div className="page-subtitle">Manage your mining workforce</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row row-deck row-cards mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Active Workers</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-success">{activeWorkers}</span>
                  </div>
                </div>
                <div className="h1 m-0">{activeWorkers}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Pending</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-warning">{pendingWorkers}</span>
                  </div>
                </div>
                <div className="h1 m-0">{pendingWorkers}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Inactive</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-danger">{inactiveWorkers}</span>
                  </div>
                </div>
                <div className="h1 m-0">{inactiveWorkers}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Total Workers</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-primary">{workers.length}</span>
                  </div>
                </div>
                <div className="h1 m-0">{workers.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="row row-deck row-cards mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-8">
                    <div className="input-group">
                      <span className="input-group-text">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <circle cx="10" cy="10" r="7" />
                          <path d="M21 21l-6 -6" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search workers by name, ID, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
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

        {/* Workers Grid */}
        <div className="row row-deck row-cards">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  Workers ({filteredWorkers.length})
                  {searchTerm && (
                    <span className="text-muted ms-2">
                      filtered from {workers.length}
                    </span>
                  )}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="row row-deck row-cards">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))
          ) : (
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="empty">
                    <div className="empty-img">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-lg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                      </svg>
                    </div>
                    <p className="empty-title">No workers found</p>
                    <p className="empty-subtitle text-muted">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Add your first worker to get started"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}