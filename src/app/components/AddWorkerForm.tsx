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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newWorker: Worker = {
      id: Date.now().toString(),
      ...formData,
      lastSeen: "Just added",
    };

    onAddWorker(newWorker);

    // Reset form
    setFormData({
      name: "",
      employeeId: "",
      role: "",
      status: "pending",
    });
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