"use client";
import { useState } from "react";
import { WorkerDocument } from "../documents/page";

interface DocumentUploadProps {
  onUpload: (documents: WorkerDocument[]) => void;
}

interface UploadedFile {
  file: File;
  type: WorkerDocument["type"];
  expiryDate?: string;
  workerId?: string;
  workerName?: string;
  description?: string;
}

// Sample workers for dropdown
const sampleWorkers = [
  { id: "1", name: "John Smith", employeeId: "EMP001" },
  { id: "2", name: "Sarah Johnson", employeeId: "EMP002" },
  { id: "3", name: "Mike Wilson", employeeId: "EMP003" },
  { id: "4", name: "Lisa Chen", employeeId: "EMP004" },
];

export default function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      
      return file.size <= maxSize && allowedTypes.includes(fileExtension);
    });

    const newUploadedFiles = validFiles.map(file => ({
      file,
      type: "other" as WorkerDocument["type"],
      description: "",
    }));

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
  };

  const updateFileDetails = (index: number, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getExpiryDateStatus = (expiryDate: string): WorkerDocument["status"] => {
    if (!expiryDate) return "valid";
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 30) return "expiring";
    return "valid";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    const documentsToUpload: WorkerDocument[] = uploadedFiles.map(uploadedFile => {
      const selectedWorker = uploadedFile.workerId 
        ? sampleWorkers.find(w => w.id === uploadedFile.workerId)
        : undefined;

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: uploadedFile.file.name,
        type: uploadedFile.type,
        file: uploadedFile.file,
        uploadedAt: new Date().toISOString(),
        expiryDate: uploadedFile.expiryDate || undefined,
        workerId: uploadedFile.workerId || undefined,
        workerName: selectedWorker?.name || undefined,
        status: uploadedFile.expiryDate ? getExpiryDateStatus(uploadedFile.expiryDate) : "valid",
        fileSize: uploadedFile.file.size,
        description: uploadedFile.description || undefined,
      };
    });

    onUpload(documentsToUpload);
    
    // Reset form
    setUploadedFiles([]);
    setIsOpen(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) {
    return (
      <div className="col-12">
        <button className="btn btn-primary btn-lg" onClick={() => setIsOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
            <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
            <path d="M12 11v6"/>
            <path d="M9.5 13.5l2.5 -2.5l2.5 2.5"/>
          </svg>
          Upload Documents
        </button>
      </div>
    );
  }

  return (
    <div className="col-12">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Upload Documents</h3>
          <button
            className="btn-close"
            onClick={() => {
              setIsOpen(false);
              setUploadedFiles([]);
            }}
          ></button>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* File Drop Zone */}
            <div
              className={`card mb-4 ${dragActive ? "border-primary bg-light" : "border-dashed"}`}
              style={{ minHeight: "150px", cursor: "pointer" }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                <div className="avatar avatar-lg mb-3 bg-primary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                    <path d="M12 11v6"/>
                    <path d="M9.5 13.5l2.5 -2.5l2.5 2.5"/>
                  </svg>
                </div>
                <h4 className="mb-1">Drag and drop files here</h4>
                <p className="text-muted mb-0">or click to browse files</p>
                <small className="text-muted">
                  Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
                </small>
              </div>
            </div>

            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileInput}
              className="d-none"
            />

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-3">Files to Upload ({uploadedFiles.length})</h4>
                <div className="space-y-3">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div key={index} className="card">
                      <div className="card-body">
                        <div className="row align-items-center mb-3">
                          <div className="col-md-8">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm me-3 bg-secondary text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                  <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                                  <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                                </svg>
                              </div>
                              <div>
                                <div className="fw-bold">{uploadedFile.file.name}</div>
                                <div className="text-muted small">
                                  {formatFileSize(uploadedFile.file.size)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFile(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Document Type</label>
                            <select
                              className="form-select"
                              value={uploadedFile.type}
                              onChange={(e) => updateFileDetails(index, { 
                                type: e.target.value as WorkerDocument["type"] 
                              })}
                              required
                            >
                              <option value="other">Other</option>
                              <option value="id">ID Document</option>
                              <option value="certification">Certification</option>
                              <option value="training">Training Record</option>
                              <option value="medical">Medical Certificate</option>
                            </select>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Assign to Worker (Optional)</label>
                            <select
                              className="form-select"
                              value={uploadedFile.workerId || ""}
                              onChange={(e) => updateFileDetails(index, { 
                                workerId: e.target.value || undefined,
                                workerName: e.target.value 
                                  ? sampleWorkers.find(w => w.id === e.target.value)?.name
                                  : undefined
                              })}
                            >
                              <option value="">Select Worker</option>
                              {sampleWorkers.map(worker => (
                                <option key={worker.id} value={worker.id}>
                                  {worker.name} ({worker.employeeId})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Expiry Date (Optional)</label>
                            <input
                              type="date"
                              className="form-control"
                              value={uploadedFile.expiryDate || ""}
                              onChange={(e) => updateFileDetails(index, { 
                                expiryDate: e.target.value || undefined 
                              })}
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Description (Optional)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Brief description"
                              value={uploadedFile.description || ""}
                              onChange={(e) => updateFileDetails(index, { 
                                description: e.target.value || undefined 
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="btn-list">
              <button type="submit" className="btn btn-primary" disabled={uploadedFiles.length === 0}>
                Upload {uploadedFiles.length} Document{uploadedFiles.length !== 1 ? "s" : ""}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsOpen(false);
                  setUploadedFiles([]);
                }}
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