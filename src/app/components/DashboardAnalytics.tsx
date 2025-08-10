"use client";
import { useState, useEffect } from "react";
import AnalyticsChart from "./AnalyticsChart";
import { WorkerDocument } from "../documents/page";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  department?: string;
  lastSeen: string;
}

interface DashboardAnalyticsProps {
  workers: Worker[];
  documents: WorkerDocument[];
  scanHistory?: any[];
}

interface KPIMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "stable";
  color?: string;
  icon?: React.ReactNode;
}

export default function DashboardAnalytics({ workers, documents, scanHistory = [] }: DashboardAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [selectedMetrics, setSelectedMetrics] = useState(["workers", "documents", "compliance"]);

  // Calculate KPIs
  const calculateKPIs = (): KPIMetric[] => {
    const activeWorkers = workers.filter(w => w.status === "active").length;
    const totalWorkers = workers.length;
    const complianceRate = documents.filter(d => d.status === "valid").length / Math.max(documents.length, 1);
    const expiringDocs = documents.filter(d => d.status === "expiring").length;

    return [
      {
        label: "Active Workers",
        value: activeWorkers,
        change: 5.2,
        trend: "up",
        color: "success",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="7" r="4"/>
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>
          </svg>
        )
      },
      {
        label: "Compliance Rate",
        value: `${(complianceRate * 100).toFixed(1)}%`,
        change: complianceRate > 0.9 ? 2.1 : -1.5,
        trend: complianceRate > 0.9 ? "up" : "down",
        color: complianceRate > 0.9 ? "success" : "warning",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>
            <polyline points="9,12 12,15 22,6"/>
          </svg>
        )
      },
      {
        label: "Documents Expiring",
        value: expiringDocs,
        change: expiringDocs > 5 ? 15.3 : -2.1,
        trend: expiringDocs > 5 ? "up" : "down",
        color: expiringDocs > 5 ? "danger" : "info",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        )
      },
      {
        label: "Total Scans Today",
        value: scanHistory.filter(s => 
          new Date(s.timestamp).toDateString() === new Date().toDateString()
        ).length,
        change: 8.7,
        trend: "up",
        color: "primary",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="6" height="6" rx="1"/>
            <rect x="4" y="14" width="6" height="6" rx="1"/>
            <rect x="14" y="4" width="6" height="6" rx="1"/>
          </svg>
        )
      }
    ];
  };

  // Generate chart data
  const getWorkerStatusChart = () => {
    const statusCounts = workers.reduce((acc, worker) => {
      acc[worker.status] = (acc[worker.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        label: "Workers by Status",
        data: Object.values(statusCounts),
        backgroundColor: [
          '#28a745', // active - green
          '#ffc107', // pending - yellow  
          '#6c757d', // inactive - gray
          '#dc3545'  // suspended - red
        ]
      }]
    };
  };

  const getDocumentTypeChart = () => {
    const typeCounts = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(typeCounts).map(t => t.toUpperCase()),
      datasets: [{
        label: "Documents by Type", 
        data: Object.values(typeCounts),
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
        borderWidth: 1
      }]
    };
  };

  const getComplianceTrendChart = () => {
    // Generate last 7 days of compliance data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    // Simulate compliance percentages
    const complianceData = [85, 87, 82, 90, 88, 91, 89];

    return {
      labels: last7Days,
      datasets: [{
        label: "Compliance Rate (%)",
        data: complianceData,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    };
  };

  const getRoleDistributionChart = () => {
    const roleCounts = workers.reduce((acc, worker) => {
      acc[worker.role] = (acc[worker.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(roleCounts),
      datasets: [{
        label: "Workers by Role",
        data: Object.values(roleCounts),
        backgroundColor: [
          '#007bff',
          '#28a745', 
          '#ffc107',
          '#dc3545',
          '#17a2b8',
          '#6f42c1'
        ]
      }]
    };
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-success" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
            <polyline points="16,7 22,7 22,13"/>
          </svg>
        );
      case "down":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-danger" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22,17 13.5,8.5 8.5,13.5 2,7"/>
            <polyline points="16,17 22,17 22,11"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="icon text-muted" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        );
    }
  };

  const kpis = calculateKPIs();

  return (
    <div>
      {/* Time Range Selector */}
      <div className="row mb-4">
        <div className="col">
          <div className="btn-group" role="group">
            {[
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "90d", label: "90 Days" },
              { key: "1y", label: "1 Year" }
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`btn ${timeRange === key ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                onClick={() => setTimeRange(key as any)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row row-deck row-cards mb-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">{kpi.label}</div>
                  <div className="ms-auto">
                    <div className={`text-${kpi.color}`}>
                      {kpi.icon}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-baseline">
                  <div className="h1 mb-0 me-2">{kpi.value}</div>
                  {kpi.change && (
                    <div className="ms-auto">
                      <span className={`text-${kpi.trend === 'up' ? 'success' : kpi.trend === 'down' ? 'danger' : 'muted'} d-inline-flex align-items-center lh-1`}>
                        {Math.abs(kpi.change)}%
                        {getTrendIcon(kpi.trend!)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row row-deck row-cards">
        <div className="col-md-6">
          <AnalyticsChart
            type="doughnut"
            data={getWorkerStatusChart()}
            title="Worker Status Distribution"
            height={300}
          />
        </div>
        
        <div className="col-md-6">
          <AnalyticsChart
            type="bar"
            data={getDocumentTypeChart()}
            title="Documents by Type"
            height={300}
          />
        </div>

        <div className="col-md-8">
          <AnalyticsChart
            type="line"
            data={getComplianceTrendChart()}
            title="Compliance Rate Trend"
            height={300}
          />
        </div>

        <div className="col-md-4">
          <AnalyticsChart
            type="pie"
            data={getRoleDistributionChart()}
            title="Worker Roles"
            height={300}
          />
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="row row-deck row-cards mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Insights</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="list-group list-group-flush">
                    <div className="list-group-item px-0">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success me-3">High</span>
                        <div>
                          <div className="fw-medium">Worker Engagement</div>
                          <div className="text-muted small">
                            {workers.filter(w => w.status === 'active').length} of {workers.length} workers are currently active
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="list-group-item px-0">
                      <div className="d-flex align-items-center">
                        <span className={`badge bg-${documents.filter(d => d.status === 'expired').length > 0 ? 'warning' : 'success'} me-3`}>
                          {documents.filter(d => d.status === 'expired').length > 0 ? 'Medium' : 'Low'}
                        </span>
                        <div>
                          <div className="fw-medium">Compliance Risk</div>
                          <div className="text-muted small">
                            {documents.filter(d => d.status === 'expired').length} expired documents need attention
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="list-group-item px-0">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-info me-3">Normal</span>
                        <div>
                          <div className="fw-medium">System Activity</div>
                          <div className="text-muted small">
                            Average of {Math.round(scanHistory.length / 7)} scans per day this week
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="h5 mb-3">Recommended Actions</div>
                  <div className="list-group list-group-flush">
                    {documents.filter(d => d.status === 'expiring').length > 0 && (
                      <div className="list-group-item px-0">
                        <div className="d-flex align-items-center">
                          <div className="text-warning me-2">⚠️</div>
                          <div>
                            <div className="fw-medium">Review Expiring Documents</div>
                            <div className="text-muted small">
                              {documents.filter(d => d.status === 'expiring').length} documents expire within 30 days
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {workers.filter(w => w.status === 'pending').length > 0 && (
                      <div className="list-group-item px-0">
                        <div className="d-flex align-items-center">
                          <div className="text-info me-2">ℹ️</div>
                          <div>
                            <div className="fw-medium">Complete Worker Onboarding</div>
                            <div className="text-muted small">
                              {workers.filter(w => w.status === 'pending').length} workers are pending approval
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="list-group-item px-0">
                      <div className="d-flex align-items-center">
                        <div className="text-success me-2">✅</div>
                        <div>
                          <div className="fw-medium">Schedule Safety Training</div>
                          <div className="text-muted small">
                            Plan quarterly safety refresher for all active workers
                          </div>
                        </div>
                      </div>
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