"use client";
import { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import WorkerVerification from "../components/WorkerVerification";
import ScanHistory from "../components/ScanHistory";

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: "active" | "inactive" | "pending";
  role: string;
  lastSeen: string;
  documents?: WorkerDocument[];
}

interface WorkerDocument {
  id: string;
  name: string;
  type: "id" | "certification" | "training" | "medical" | "other";
  file: File;
  uploadedAt: string;
  expiryDate?: string;
  status: "valid" | "expiring" | "expired";
}

interface ScanResult {
  id: string;
  timestamp: string;
  workerData: Record<string, unknown>;
  worker?: Worker;
  status: "success" | "error" | "not_found";
  location?: string;
}

// Sample workers data for verification
const sampleWorkers: Worker[] = [
  {
    id: "1",
    name: "John Smith",
    employeeId: "EMP001",
    status: "active",
    role: "Site Supervisor",
    lastSeen: "2 hours ago",
  },
  {
    id: "2",
    name: "Sarah Johnson", 
    employeeId: "EMP002",
    status: "active",
    role: "Safety Officer",
    lastSeen: "30 minutes ago",
  },
  {
    id: "3",
    name: "Mike Wilson",
    employeeId: "EMP003",
    status: "pending",
    role: "Equipment Operator",
    lastSeen: "1 day ago",
  },
];

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  // Check camera permission and setup offline detection
  useEffect(() => {
    checkCameraPermission();
    
    // Setup offline/online event listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load scan history from localStorage on mount
    const savedHistory = localStorage.getItem('scan-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setScanHistory(parsedHistory);
      } catch {
        // Ignore invalid saved data
      }
    }
    
    return () => {
      stopScanner();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save scan history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('scan-history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch {
      setHasPermission(false);
      setError("Camera permission denied. Please enable camera access to scan QR codes.");
    }
  };

  const startScanner = async () => {
    if (!videoRef.current || !hasPermission) return;

    try {
      setError(null);
      setIsScanning(true);

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
    } catch {
      setError("Failed to start camera. Please check permissions and try again.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      const worker = sampleWorkers.find(w => w.id === qrData.id);
      
      const result: ScanResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        workerData: qrData,
        worker: worker,
        status: worker ? "success" : "not_found",
        location: "Main Gate", // Could be determined by GPS or user selection
      };

      setScanResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 scans
      
      // Stop scanner after successful scan
      stopScanner();
      
      // Update worker's last seen if found
      if (worker) {
        // In a real app, this would update the backend
        console.log(`Worker ${worker.name} verified at ${new Date().toLocaleString()}`);
      }
    } catch {
      const errorResult: ScanResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        workerData: { raw: data },
        status: "error",
        location: "Main Gate",
      };
      
      setScanResult(errorResult);
      setScanHistory(prev => [errorResult, ...prev.slice(0, 49)]);
      setError("Invalid QR code format. Please scan a valid mine pass.");
    }
  };

  const clearResults = () => {
    setScanResult(null);
    setError(null);
  };

  const clearHistory = () => {
    setScanHistory([]);
  };

  return (
    <div className="page-wrapper">
      <div className="container-fluid">
        <div className="page-header d-print-none">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">
                QR Scanner
                {isOffline && (
                  <span className="badge bg-warning ms-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M22 12c-2 4-4 6-10 6s-8-2-10-6c2-4 4-6 10-6s8 2 10 6"/>
                      <path d="M22 12c-1.7 3.4-3.5 5.4-8 5.4s-6.3-2-8-5.4"/>
                      <path d="M12 12v.01"/>
                    </svg>
                    Offline Mode
                  </span>
                )}
              </h2>
              <div className="page-subtitle">
                Verify worker mine passes at site entry
                {isOffline && <span className="text-warning ms-2">• Working offline - data cached locally</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Status Cards */}
        <div className="row row-deck row-cards mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Today&apos;s Scans</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-primary">{scanHistory.filter(s => 
                      new Date(s.timestamp).toDateString() === new Date().toDateString()
                    ).length}</span>
                  </div>
                </div>
                <div className="h1 m-0">
                  {scanHistory.filter(s => 
                    new Date(s.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Successful</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-success">{scanHistory.filter(s => s.status === "success").length}</span>
                  </div>
                </div>
                <div className="h1 m-0">{scanHistory.filter(s => s.status === "success").length}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Not Found</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-warning">{scanHistory.filter(s => s.status === "not_found").length}</span>
                  </div>
                </div>
                <div className="h1 m-0">{scanHistory.filter(s => s.status === "not_found").length}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="subheader">Errors</div>
                  <div className="ms-auto lh-1">
                    <span className="badge bg-danger">{scanHistory.filter(s => s.status === "error").length}</span>
                  </div>
                </div>
                <div className="h1 m-0">{scanHistory.filter(s => s.status === "error").length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Interface */}
        <div className="row row-deck row-cards mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Camera Scanner</h3>
                <div className="card-actions">
                  {isScanning ? (
                    <button 
                      className="btn btn-danger"
                      onClick={stopScanner}
                    >
                      Stop Scanning
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={startScanner}
                      disabled={!hasPermission}
                    >
                      Start Scanning
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                {hasPermission === false && (
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
                        <h4 className="alert-title">Camera Permission Required</h4>
                        <div className="text-muted">Please enable camera access to scan QR codes.</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="scanner-container" style={{ position: "relative", maxWidth: "500px", margin: "0 auto" }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      backgroundColor: "#f8f9fa",
                      display: isScanning ? "block" : "none",
                    }}
                  />
                  
                  {!isScanning && (
                    <div 
                      className="d-flex flex-column align-items-center justify-content-center text-center"
                      style={{ minHeight: "300px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}
                    >
                      <div className="avatar avatar-xl mb-3 bg-secondary text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <rect x="4" y="4" width="6" height="6" rx="1"/>
                          <rect x="4" y="14" width="6" height="6" rx="1"/>
                          <rect x="14" y="4" width="6" height="6" rx="1"/>
                          <rect x="14" y="14" width="6" height="6" rx="1"/>
                        </svg>
                      </div>
                      <h4 className="mb-1">QR Scanner Ready</h4>
                      <p className="text-muted">Click &quot;Start Scanning&quot; to begin</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="alert alert-danger mt-3">
                    <div className="d-flex">
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                          <circle cx="12" cy="12" r="9"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <div>{error}</div>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <small className="text-muted">
                    Position the QR code within the camera view. The scanner will automatically detect and verify mine passes.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Scan Result */}
          <div className="col-md-4">
            {scanResult ? (
              <WorkerVerification 
                scanResult={scanResult} 
                onClear={clearResults}
                onRescan={startScanner}
              />
            ) : (
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="empty">
                    <div className="empty-img">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <circle cx="12" cy="12" r="2"/>
                        <path d="M22 12c-2 4-4 6-10 6s-8-2-10-6c2-4 4-6 10-6s8 2 10 6"/>
                      </svg>
                    </div>
                    <p className="empty-title">No scan result</p>
                    <p className="empty-subtitle text-muted">
                      Scan a QR code to see verification results
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scan History */}
        <div className="row row-deck row-cards">
          <div className="col-12">
            <ScanHistory 
              scanHistory={scanHistory} 
              onClearHistory={clearHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}