import WorkerCard from "./components/WorkerCard";

// Sample data (later this will come from database)
const sampleWorkers = [
  {
    id: "1",
    name: "John Smith",
    employeeId: "EMP001",
    status: "active" as const,
    role: "Site Supervisor",
    lastSeen: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    employeeId: "EMP002",
    status: "active" as const,
    role: "Safety Officer",
    lastSeen: "30 minutes ago",
  },
  {
    id: "3",
    name: "Mike Wilson",
    employeeId: "EMP003",
    status: "pending" as const,
    role: "Equipment Operator",
    lastSeen: "1 day ago",
  },
  {
    id: "4",
    name: "Lisa Chen",
    employeeId: "EMP004",
    status: "inactive" as const,
    role: "Training Coordinator",
    lastSeen: "3 days ago",
  },
];

export default function Home() {
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

        {/* System Status Card */}
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
                      <span className="text-success">Online</span>
                      <div className="h1 m-0">234</div>
                      <div className="text-muted">Active Workers</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center">
                      <span className="badge bg-warning me-1"></span>
                      <span className="text-warning">Pending</span>
                      <div className="h1 m-0">12</div>
                      <div className="text-muted">Documents</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-center">
                      <span className="badge bg-danger me-1"></span>
                      <span className="text-danger">Expired</span>
                      <div className="h1 m-0">3</div>
                      <div className="text-muted">Certifications</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workers Section */}
        <div className="row row-deck row-cards">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Workers</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="row row-deck row-cards">
          {sampleWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      </div>
    </div>
  );
}
