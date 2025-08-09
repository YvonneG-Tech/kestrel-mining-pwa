"use client";
import { useState } from "react";
import DocumentCard from "../components/DocumentCard";
import DocumentUpload from "../components/DocumentUpload";

export interface WorkerDocument {
  id: string;
  name: string;
  type: "id" | "certification" | "training" | "medical" | "other";
  file: File;
  uploadedAt: string;
  expiryDate?: string;
  workerId?: string;
  workerName?: string;
  status: "valid" | "expiring" | "expired";
  fileSize: number;
  description?: string;
}

// Sample documents data
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
    fileSize: 2048576, // 2MB
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
    fileSize: 1536000, // 1.5MB
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
    fileSize: 3145728, // 3MB
    description: "Basic first aid and CPR training",
  },
  {
    id: "4",
    name: "Medical Clearance.pdf",
    type: "medical",
    file: new File([""], "Medical Clearance.pdf", { type: "application/pdf" }),
    uploadedAt: "2024-03-01T11:45:00Z",
    expiryDate: "2025-03-01",
    workerId: "1",
    workerName: "John Smith",
    status: "valid",
    fileSize: 1024000, // 1MB
    description: "Annual medical fitness assessment",
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<WorkerDocument[]>(sampleDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | WorkerDocument["type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkerDocument["status"]>("all");
  const [sortBy, setSortBy] = useState<"name" | "uploadedAt" | "expiryDate">("uploadedAt");

  const handleAddDocuments = (newDocuments: WorkerDocument[]) => {
    setDocuments((prevDocs) => [...prevDocs, ...newDocuments]);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments((prevDocs) => prevDocs.filter(doc => doc.id !== documentId));
  };

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.workerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || doc.type === typeFilter;
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "expiryDate":
          if (!a.expiryDate && !b.expiryDate) return 0;
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case "uploadedAt":
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

  // Calculate stats
  const validDocs = documents.filter(doc => doc.status === "valid").length;
  const expiringDocs = documents.filter(doc => doc.status === "expiring").length;
  const expiredDocs = documents.filter(doc => doc.status === "expired").length;

  return (
    <div className="page-wrapper">
      <div className="container-fluid">
        <div className="page-header d-print-none">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">Document Management</h2>
              <div className="page-subtitle">Manage worker documents and certifications</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row row-deck row-cards mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Valid Documents</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-success">{validDocs}</span>
                  </div>
                </div>
                <div className="h1 m-0">{validDocs}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Expiring Soon</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-warning">{expiringDocs}</span>
                  </div>
                </div>
                <div className="h1 m-0">{expiringDocs}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Expired</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-danger">{expiredDocs}</span>
                  </div>
                </div>
                <div className="h1 m-0">{expiredDocs}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Total Documents</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-primary">{documents.length}</span>
                  </div>
                </div>
                <div className="h1 m-0">{documents.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="row row-deck row-cards mb-4">
          <DocumentUpload onUpload={handleAddDocuments} />
        </div>

        {/* Search and Filter */}
        <div className="row row-deck row-cards mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
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
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                    >
                      <option value="all">All Types</option>
                      <option value="id">ID Documents</option>
                      <option value="certification">Certifications</option>
                      <option value="training">Training</option>
                      <option value="medical">Medical</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    >
                      <option value="all">All Status</option>
                      <option value="valid">Valid</option>
                      <option value="expiring">Expiring</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    >
                      <option value="uploadedAt">Upload Date</option>
                      <option value="name">Name</option>
                      <option value="expiryDate">Expiry Date</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button 
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm("");
                        setTypeFilter("all");
                        setStatusFilter("all");
                        setSortBy("uploadedAt");
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="row row-deck row-cards">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  Documents ({filteredDocuments.length})
                  {searchTerm && (
                    <span className="text-muted ms-2">
                      filtered from {documents.length}
                    </span>
                  )}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="row row-deck row-cards">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <DocumentCard 
                key={document.id} 
                document={document} 
                onDelete={handleDeleteDocument}
              />
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
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                      </svg>
                    </div>
                    <p className="empty-title">No documents found</p>
                    <p className="empty-subtitle text-muted">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Upload your first document to get started"}
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