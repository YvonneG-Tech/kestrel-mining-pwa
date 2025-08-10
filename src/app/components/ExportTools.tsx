"use client";
import { useState } from "react";
import { WorkerDocument } from "../documents/page";

interface ExportToolsProps {
  documents: WorkerDocument[];
  selectedDocuments: string[];
}

export default function ExportTools({ documents, selectedDocuments }: ExportToolsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportToCsv = (documentsToExport: WorkerDocument[]) => {
    const headers = [
      'Document Name',
      'Type', 
      'Status',
      'Worker Name',
      'Employee ID',
      'File Size (MB)',
      'Upload Date',
      'Expiry Date',
      'Description'
    ];

    const csvContent = [
      headers.join(','),
      ...documentsToExport.map(doc => [
        `"${doc.name}"`,
        doc.type.toUpperCase(),
        doc.status.toUpperCase(),
        `"${doc.workerName || 'Unassigned'}"`,
        doc.workerId || 'N/A',
        (doc.fileSize / (1024 * 1024)).toFixed(2),
        new Date(doc.uploadedAt).toLocaleDateString('en-AU'),
        doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('en-AU') : 'N/A',
        `"${doc.description || ''}"`
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `documents-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = async (documentsToExport: WorkerDocument[]) => {
    setIsExporting(true);
    
    // Create HTML content for PDF
    const htmlContent = generatePdfHtml(documentsToExport);
    
    // Open in new window for printing to PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Trigger print dialog after content loads
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setIsExporting(false);
        }, 500);
      };
    }
    
    setIsExporting(false);
  };

  const generatePdfHtml = (documentsToExport: WorkerDocument[]) => {
    const validDocs = documentsToExport.filter(d => d.status === 'valid').length;
    const expiringDocs = documentsToExport.filter(d => d.status === 'expiring').length;
    const expiredDocs = documentsToExport.filter(d => d.status === 'expired').length;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kestrel Mining - Document Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.4;
            }
            .header { 
              border-bottom: 2px solid #007bff; 
              padding-bottom: 15px; 
              margin-bottom: 20px;
            }
            .header h1 { 
              color: #007bff; 
              margin: 0;
              font-size: 28px;
            }
            .header .subtitle { 
              color: #6c757d; 
              margin: 5px 0;
              font-size: 16px;
            }
            .header .date {
              color: #6c757d;
              font-size: 14px;
              margin-top: 10px;
            }
            .stats { 
              display: flex; 
              gap: 30px; 
              margin: 20px 0; 
              flex-wrap: wrap;
            }
            .stat-card { 
              border: 1px solid #e9ecef; 
              border-radius: 8px; 
              padding: 15px; 
              min-width: 150px;
              background: #f8f9fa;
            }
            .stat-card h3 { 
              margin: 0; 
              color: #495057;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .stat-card .number { 
              font-size: 32px; 
              font-weight: bold; 
              margin: 5px 0;
            }
            .stat-card.valid .number { color: #28a745; }
            .stat-card.expiring .number { color: #ffc107; }
            .stat-card.expired .number { color: #dc3545; }
            .stat-card.total .number { color: #007bff; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #dee2e6; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: 600;
              color: #495057;
            }
            .status-badge {
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-valid { background: #d4edda; color: #155724; }
            .status-expiring { background: #fff3cd; color: #856404; }
            .status-expired { background: #f8d7da; color: #721c24; }
            .type-badge {
              background: #e9ecef;
              color: #495057;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              text-transform: uppercase;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #dee2e6;
              color: #6c757d;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .stats { page-break-inside: avoid; }
              table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Kestrel Mining</h1>
            <div class="subtitle">Document Management Report</div>
            <div class="date">Generated: ${new Date().toLocaleString('en-AU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
          
          <div class="stats">
            <div class="stat-card valid">
              <h3>Valid Documents</h3>
              <div class="number">${validDocs}</div>
            </div>
            <div class="stat-card expiring">
              <h3>Expiring Soon</h3>
              <div class="number">${expiringDocs}</div>
            </div>
            <div class="stat-card expired">
              <h3>Expired</h3>
              <div class="number">${expiredDocs}</div>
            </div>
            <div class="stat-card total">
              <h3>Total Documents</h3>
              <div class="number">${documentsToExport.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Worker</th>
                <th>File Size</th>
                <th>Upload Date</th>
                <th>Expiry Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${documentsToExport.map(doc => `
                <tr>
                  <td><strong>${doc.name}</strong></td>
                  <td><span class="type-badge">${doc.type.toUpperCase()}</span></td>
                  <td><span class="status-badge status-${doc.status}">${doc.status.toUpperCase()}</span></td>
                  <td>${doc.workerName || 'Unassigned'}</td>
                  <td>${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</td>
                  <td>${new Date(doc.uploadedAt).toLocaleDateString('en-AU')}</td>
                  <td>${doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('en-AU') : 'N/A'}</td>
                  <td>${doc.description || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report contains ${documentsToExport.length} document${documentsToExport.length !== 1 ? 's' : ''} from the Kestrel Mining document management system.</p>
            <p>Report generated by: Kestrel Mining Workforce Management System</p>
          </div>
        </body>
      </html>
    `;
  };

  const exportSummaryReport = async () => {
    setIsExporting(true);
    
    // Generate summary data
    const typeBreakdown = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const workerBreakdown = documents.reduce((acc, doc) => {
      const worker = doc.workerName || 'Unassigned';
      acc[worker] = (acc[worker] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kestrel Mining - Summary Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #007bff; padding-bottom: 15px; margin-bottom: 30px; }
            .header h1 { color: #007bff; margin: 0; font-size: 28px; }
            .section { margin: 30px 0; page-break-inside: avoid; }
            .section h2 { color: #495057; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; }
            .chart-container { display: flex; gap: 30px; flex-wrap: wrap; margin: 20px 0; }
            .chart { border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; min-width: 300px; background: #f8f9fa; }
            .chart h3 { margin-top: 0; color: #495057; }
            .bar-chart { margin: 15px 0; }
            .bar-item { display: flex; align-items: center; margin: 8px 0; }
            .bar-label { min-width: 120px; font-size: 14px; }
            .bar-visual { background: #007bff; height: 20px; border-radius: 10px; margin: 0 10px; position: relative; }
            .bar-value { font-weight: bold; min-width: 40px; }
            .insights { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; }
            .alert { padding: 15px; border-radius: 8px; margin: 15px 0; }
            .alert-warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
            .alert-danger { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Kestrel Mining</h1>
            <div class="subtitle">Document Management Summary Report</div>
            <div class="date">Generated: ${new Date().toLocaleString('en-AU')}</div>
          </div>

          <div class="section">
            <h2>Document Overview</h2>
            <div class="chart-container">
              <div class="chart">
                <h3>Documents by Type</h3>
                <div class="bar-chart">
                  ${Object.entries(typeBreakdown).map(([type, count]) => `
                    <div class="bar-item">
                      <div class="bar-label">${type.toUpperCase()}</div>
                      <div class="bar-visual" style="width: ${(count / Math.max(...Object.values(typeBreakdown))) * 200}px;"></div>
                      <div class="bar-value">${count}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="chart">
                <h3>Documents by Status</h3>
                <div class="bar-chart">
                  ${Object.entries(statusBreakdown).map(([status, count]) => `
                    <div class="bar-item">
                      <div class="bar-label">${status.toUpperCase()}</div>
                      <div class="bar-visual" style="width: ${(count / Math.max(...Object.values(statusBreakdown))) * 200}px; background: ${
                        status === 'valid' ? '#28a745' : status === 'expiring' ? '#ffc107' : '#dc3545'
                      };"></div>
                      <div class="bar-value">${count}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Worker Document Distribution</h2>
            <div class="chart">
              <div class="bar-chart">
                ${Object.entries(workerBreakdown).sort(([,a], [,b]) => b - a).slice(0, 10).map(([worker, count]) => `
                  <div class="bar-item">
                    <div class="bar-label">${worker}</div>
                    <div class="bar-visual" style="width: ${(count / Math.max(...Object.values(workerBreakdown))) * 300}px;"></div>
                    <div class="bar-value">${count}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Insights & Recommendations</h2>
            <div class="insights">
              <h3>Key Findings:</h3>
              <ul>
                <li>Total documents in system: <strong>${documents.length}</strong></li>
                <li>Documents requiring attention: <strong>${statusBreakdown.expiring || 0} expiring, ${statusBreakdown.expired || 0} expired</strong></li>
                <li>Unassigned documents: <strong>${workerBreakdown['Unassigned'] || 0}</strong></li>
                <li>Most common document type: <strong>${Object.entries(typeBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0]?.toUpperCase() || 'N/A'}</strong></li>
              </ul>
            </div>

            ${(statusBreakdown.expired || 0) > 0 ? `
              <div class="alert alert-danger">
                <strong>Action Required:</strong> ${statusBreakdown.expired} document${statusBreakdown.expired !== 1 ? 's have' : ' has'} expired and need${statusBreakdown.expired === 1 ? 's' : ''} immediate attention.
              </div>
            ` : ''}

            ${(statusBreakdown.expiring || 0) > 0 ? `
              <div class="alert alert-warning">
                <strong>Notice:</strong> ${statusBreakdown.expiring} document${statusBreakdown.expiring !== 1 ? 's are' : ' is'} expiring soon and should be renewed.
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setIsExporting(false);
        }, 500);
      };
    }
    
    setIsExporting(false);
  };

  const documentsToExport = selectedDocuments.length > 0 
    ? documents.filter(doc => selectedDocuments.includes(doc.id))
    : documents;

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-primary"
        onClick={() => setShowExportMenu(!showExportMenu)}
        disabled={isExporting}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
          <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
          <path d="M10 12l4 0"/>
          <path d="M10 16l4 0"/>
        </svg>
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {showExportMenu && (
        <div className="dropdown-menu show">
          <div className="dropdown-header">
            Export {selectedDocuments.length > 0 ? `${selectedDocuments.length} selected` : 'all'} documents
          </div>
          
          <button
            className="dropdown-item"
            onClick={() => {
              exportToCsv(documentsToExport);
              setShowExportMenu(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-2" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
              <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
              <path d="M11 12.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0"/>
              <path d="M14 14h1.5a1.5 1.5 0 0 1 0 3h-1.5"/>
            </svg>
            Export as CSV
            <div className="text-muted small">Spreadsheet format</div>
          </button>

          <button
            className="dropdown-item"
            onClick={() => {
              exportToPdf(documentsToExport);
              setShowExportMenu(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-2" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
              <path d="M17 21h-10a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
              <path d="M11 12.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0"/>
              <path d="M14 14h1.5a1.5 1.5 0 0 1 0 3h-1.5"/>
            </svg>
            Export as PDF Report  
            <div className="text-muted small">Detailed document report</div>
          </button>

          <div className="dropdown-divider"></div>

          <button
            className="dropdown-item"
            onClick={() => {
              exportSummaryReport();
              setShowExportMenu(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-2" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
            Summary Report
            <div className="text-muted small">Analytics and insights</div>
          </button>
        </div>
      )}

      {/* Backdrop */}
      {showExportMenu && (
        <div
          className="dropdown-backdrop"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
}