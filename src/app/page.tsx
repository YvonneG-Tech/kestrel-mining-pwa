import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="page">
      {/* Sidebar */}
      <aside className="navbar navbar-vertical navbar-expand-lg" data-bs-theme="dark">
        <div className="container-fluid">
          <h1 className="navbar-brand">
            <span className="text-white">Kestrel Mining</span>
          </h1>
          <div className="navbar-nav">
            <Link className="nav-link active" href="/">Dashboard</Link>
            <Link className="nav-link" href="/workers">Workers</Link>
            <Link className="nav-link" href="/documents">Documents</Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            <div className="row">
              <div className="col-12">
                <h1>Kestrel Mining Dashboard</h1>
                <div className="card">
                  <div className="card-body">
                    <p>Active Workers: 234</p>
                    <p>Pending Documents: 12</p>
                    <p>Expired Certificates: 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}