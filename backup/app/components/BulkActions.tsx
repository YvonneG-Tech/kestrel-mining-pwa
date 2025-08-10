"use client";
import { useState } from "react";
import { WorkerDocument } from "../documents/page";

interface BulkActionsProps {
  selectedDocuments: string[];
  documents: WorkerDocument[];
  onBulkDelete: (documentIds: string[]) => void;
  onBulkStatusUpdate: (documentIds: string[], status: WorkerDocument["status"]) => void;
  onBulkWorkerAssign: (documentIds: string[], workerId: string, workerName: string) => void;
  onClearSelection: () => void;
}

// Sample workers for assignment
const sampleWorkers = [
  { id: "1", name: "John Smith", employeeId: "EMP001" },
  { id: "2", name: "Sarah Johnson", employeeId: "EMP002" },
  { id: "3", name: "Mike Wilson", employeeId: "EMP003" },
  { id: "4", name: "Lisa Chen", employeeId: "EMP004" },
];

export default function BulkActions({
  selectedDocuments,
  documents,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkWorkerAssign,
  onClearSelection,
}: BulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showWorkerAssign, setShowWorkerAssign] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<WorkerDocument["status"]>("valid");
  const [selectedWorker, setSelectedWorker] = useState("");

  if (selectedDocuments.length === 0) return null;

  const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));

  const handleBulkDelete = () => {
    onBulkDelete(selectedDocuments);
    setShowDeleteConfirm(false);
    onClearSelection();
  };

  const handleStatusUpdate = () => {
    onBulkStatusUpdate(selectedDocuments, selectedStatus);
    setShowStatusUpdate(false);
    onClearSelection();
  };

  const handleWorkerAssign = () => {
    if (!selectedWorker) return;
    
    const worker = sampleWorkers.find(w => w.id === selectedWorker);
    if (!worker) return;

    onBulkWorkerAssign(selectedDocuments, worker.id, worker.name);
    setShowWorkerAssign(false);
    setSelectedWorker("");
    onClearSelection();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalSize = () => {
    return selectedDocs.reduce((total, doc) => total + doc.fileSize, 0);
  };

  const getTypeBreakdown = () => {
    const breakdown: Record<string, number> = {};
    selectedDocs.forEach(doc => {
      breakdown[doc.type] = (breakdown[doc.type] || 0) + 1;
    });
    return breakdown;
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="row row-deck row-cards mb-4">
        <div className="col-12">
          <div className="card border-primary">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-sm me-3 bg-primary text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <polyline points="9,11 12,14 22,4"/>
                        <path d="M21 12v7a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h11"/>
                      </svg>
                    </div>
                    <div>
                      <div className="fw-bold">{selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected</div>
                      <div className="text-muted small">
                        Total size: {formatFileSize(getTotalSize())}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="btn-list justify-content-end">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowWorkerAssign(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>
                      </svg>
                      Assign Worker
                    </button>
                    
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowStatusUpdate(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <circle cx="12" cy="12" r="9"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      Update Status
                    </button>
                    
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 0 1 -2 2H7a2 2 0 0 1 -2 -2V6m3 0V4a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      Delete
                    </button>
                    
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={onClearSelection}
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal modal-blur show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Delete Documents</h4>
                <button
                  className="btn-close"
                  onClick={() => setShowDeleteConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <div className="d-flex">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <circle cx="12" cy="12" r="9"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="alert-title">Are you sure?</h4>
                      <div className="text-muted">
                        You are about to delete <strong>{selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''}</strong>. 
                        This action cannot be undone.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5>Documents to be deleted:</h5>
                  <div className="list-group list-group-flush" style={{ maxHeight: "200px", overflow: "auto" }}>
                    {selectedDocs.map(doc => (
                      <div key={doc.id} className="list-group-item px-0">
                        <div className="d-flex align-items-center">
                          <div className="flex-fill">
                            <div className="fw-medium">{doc.name}</div>
                            <div className="text-muted small">
                              {doc.workerName && `${doc.workerName} • `}
                              {doc.type.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleBulkDelete}
                >
                  Delete {selectedDocuments.length} Document{selectedDocuments.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdate && (
        <div className="modal modal-blur show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Update Document Status</h4>
                <button
                  className="btn-close"
                  onClick={() => setShowStatusUpdate(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Update the status for <strong>{selectedDocuments.length} selected document{selectedDocuments.length !== 1 ? 's' : ''}</strong>.</p>
                
                <div className="mb-3">
                  <label className="form-label">New Status</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as WorkerDocument["status"])}
                  >
                    <option value="valid">Valid</option>
                    <option value="expiring">Expiring</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div className="alert alert-info">
                  <div className="text-muted">
                    Note: This will override the automatic status calculation based on expiry dates.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowStatusUpdate(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleStatusUpdate}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Worker Assignment Modal */}
      {showWorkerAssign && (
        <div className="modal modal-blur show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Assign Documents to Worker</h4>
                <button
                  className="btn-close"
                  onClick={() => setShowWorkerAssign(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Assign <strong>{selectedDocuments.length} selected document{selectedDocuments.length !== 1 ? 's' : ''}</strong> to a worker.</p>
                
                <div className="mb-3">
                  <label className="form-label">Select Worker</label>
                  <select
                    className="form-select"
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    required
                  >
                    <option value="">Choose a worker...</option>
                    {sampleWorkers.map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} ({worker.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="alert alert-info">
                  <div className="text-muted">
                    This will assign all selected documents to the chosen worker. 
                    Documents already assigned to other workers will be reassigned.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowWorkerAssign(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleWorkerAssign}
                  disabled={!selectedWorker}
                >
                  Assign Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}