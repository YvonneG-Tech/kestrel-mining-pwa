"use client";
import { useState } from "react";
import FileUpload from "./FileUpload";

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

interface AddWorkerFormProps {
  onAddWorker: (worker: Worker) => void;
}

export default function AddWorkerForm({ onAddWorker }: AddWorkerFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    employeeId: string;
    role: string;
    status: "active" | "inactive" | "pending";
  }>({
    name: "",
    employeeId: "",
    role: "",
    status: "pending",
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<WorkerDocument[]>([]);
  const [currentDocumentType, setCurrentDocumentType] = useState<WorkerDocument["type"]>("id");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newWorker: Worker = {
      id: Date.now().toString(),
      ...formData,
      lastSeen: "Just added",
      documents: uploadedDocuments,
    };

    onAddWorker(newWorker);

    // Reset form
    setFormData({
      name: "",
      employeeId: "",
      role: "",
      status: "pending",
    });
    setUploadedDocuments([]);
    setCurrentDocumentType("id");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="col-12 mb-3">
        <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
          + Add New Worker
        </button>
      </div>
    );
  }

  return (
    <div className="col-12 mb-3">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Add New Worker</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label" htmlFor="worker-name">
                    Full Name
                  </label>
                  <input
                    id="worker-name"
                    type="text"
                    className="form-control"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label" htmlFor="employee-id">
                    Employee ID
                  </label>
                  <input
                    id="employee-id"
                    type="text"
                    className="form-control"
                    placeholder="e.g. EMP005"
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label" htmlFor="worker-role">
                    Role
                  </label>
                  <select
                    id="worker-role"
                    className="form-select"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Site Supervisor">Site Supervisor</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Equipment Operator">
                      Equipment Operator
                    </option>
                    <option value="Training Coordinator">
                      Training Coordinator
                    </option>
                    <option value="Mine Worker">Mine Worker</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label" htmlFor="worker-status">
                    Status
                  </label>
                  <select
                    id="worker-status"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as
                          | "active"
                          | "inactive"
                          | "pending",
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="row">
              <div className="col-12">
                <div className="mb-3">
                  <label className="form-label">Upload Documents</label>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="document-type">
                      Document Type
                    </label>
                    <select
                      id="document-type"
                      className="form-select"
                      value={currentDocumentType}
                      onChange={(e) =>
                        setCurrentDocumentType(
                          e.target.value as WorkerDocument["type"]
                        )
                      }
                    >
                      <option value="id">ID Document</option>
                      <option value="certification">Certification</option>
                      <option value="training">Training Record</option>
                      <option value="medical">Medical Certificate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <FileUpload
                    onFileSelect={(file) => {
                      const newDocument: WorkerDocument = {
                        id: Date.now().toString(),
                        name: file.name,
                        type: currentDocumentType,
                        file: file,
                        uploadedAt: new Date().toISOString(),
                      };
                      setUploadedDocuments([...uploadedDocuments, newDocument]);
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    maxSize={10 * 1024 * 1024} // 10MB
                    label="Upload Document"
                  />
                </div>

                {/* Display uploaded documents */}
                {uploadedDocuments.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Uploaded Documents ({uploadedDocuments.length})</label>
                    <div className="list-group">
                      {uploadedDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="list-group-item d-flex align-items-center justify-content-between"
                        >
                          <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">
                              {doc.type.toUpperCase()}
                            </span>
                            <span>{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              setUploadedDocuments(
                                uploadedDocuments.filter((d) => d.id !== doc.id)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="btn-list">
              <button type="submit" className="btn btn-primary">
                Add Worker
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}