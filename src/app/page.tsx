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

        {/* Test Card Component */}
        <div className="row row-deck row-cards">
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
      </div>
    </div>
  );
}

export const metadata = {
  title: "Kestrel Mining - Workforce Management",
  description: "Mining workforce compliance and training management",
};
