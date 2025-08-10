"use client";
import { useCallback } from "react";
import { auditLogger, AuditLogEntry } from "../components/AuditTrail";
import { useAuth } from "../components/RoleBasedAccess";

export const useAuditLogger = () => {
  const { user } = useAuth();
  
  const logAction = useCallback((
    action: string,
    resource: string,
    resourceId: string,
    description: string,
    options?: {
      details?: Record<string, any>;
      severity?: AuditLogEntry['severity'];
      category?: AuditLogEntry['category'];
      outcome?: AuditLogEntry['outcome'];
      location?: string;
    }
  ) => {
    const currentUser = user || { id: "anonymous", name: "Anonymous User", role: "User" };
    
    auditLogger.log({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      resource,
      resourceId,
      description,
      details: options?.details,
      severity: options?.severity || "low",
      category: options?.category || "user",
      location: options?.location,
      outcome: options?.outcome || "success"
    });
  }, [user]);

  // Convenience methods for common actions
  const logLogin = useCallback((success: boolean) => {
    logAction(
      "LOGIN",
      "Authentication",
      "auth-session",
      success ? "User successfully logged in" : "Failed login attempt",
      {
        severity: success ? "low" : "high",
        category: "security",
        outcome: success ? "success" : "failure"
      }
    );
  }, [logAction]);

  const logLogout = useCallback(() => {
    logAction(
      "LOGOUT",
      "Authentication", 
      "auth-session",
      "User logged out of the system",
      {
        severity: "low",
        category: "security",
        outcome: "success"
      }
    );
  }, [logAction]);

  const logWorkerAction = useCallback((
    action: "CREATE" | "UPDATE" | "DELETE" | "VIEW",
    workerId: string,
    workerName: string,
    details?: Record<string, any>
  ) => {
    const descriptions = {
      CREATE: `Created new worker profile for ${workerName}`,
      UPDATE: `Updated worker profile for ${workerName}`,
      DELETE: `Deleted worker profile for ${workerName}`,
      VIEW: `Viewed worker profile for ${workerName}`
    };

    logAction(
      action,
      "Worker",
      workerId,
      descriptions[action],
      {
        details: { workerName, ...details },
        severity: action === "DELETE" ? "high" : "medium",
        category: "data"
      }
    );
  }, [logAction]);

  const logDocumentAction = useCallback((
    action: "UPLOAD" | "UPDATE" | "DELETE" | "VIEW" | "DOWNLOAD",
    documentId: string,
    documentName: string,
    details?: Record<string, any>
  ) => {
    const descriptions = {
      UPLOAD: `Uploaded document: ${documentName}`,
      UPDATE: `Updated document: ${documentName}`,
      DELETE: `Deleted document: ${documentName}`,
      VIEW: `Viewed document: ${documentName}`,
      DOWNLOAD: `Downloaded document: ${documentName}`
    };

    logAction(
      action,
      "Document",
      documentId,
      descriptions[action],
      {
        details: { documentName, ...details },
        severity: action === "DELETE" ? "high" : "low",
        category: action === "DELETE" ? "compliance" : "data"
      }
    );
  }, [logAction]);

  const logScanAction = useCallback((
    scanId: string,
    workerData: any,
    success: boolean,
    location?: string
  ) => {
    logAction(
      "SCAN",
      "QRCode",
      scanId,
      success 
        ? `Successful QR scan for worker ${workerData.name}`
        : "Failed QR scan - worker not found or invalid code",
      {
        details: { workerData, scanLocation: location },
        severity: success ? "low" : "medium",
        category: "security",
        outcome: success ? "success" : "failure",
        location
      }
    );
  }, [logAction]);

  const logExportAction = useCallback((
    exportType: "CSV" | "PDF" | "EXCEL",
    resourceType: "Workers" | "Documents" | "Reports",
    count: number,
    details?: Record<string, any>
  ) => {
    logAction(
      "EXPORT",
      resourceType,
      `export-${Date.now()}`,
      `Exported ${count} ${resourceType.toLowerCase()} as ${exportType}`,
      {
        details: { exportType, count, ...details },
        severity: "low",
        category: "data"
      }
    );
  }, [logAction]);

  const logSecurityEvent = useCallback((
    eventType: string,
    description: string,
    severity: AuditLogEntry['severity'] = "high",
    details?: Record<string, any>
  ) => {
    logAction(
      eventType,
      "Security",
      `security-${Date.now()}`,
      description,
      {
        details,
        severity,
        category: "security",
        outcome: "warning"
      }
    );
  }, [logAction]);

  const logSystemEvent = useCallback((
    eventType: string,
    description: string,
    details?: Record<string, any>
  ) => {
    logAction(
      eventType,
      "System",
      `system-${Date.now()}`,
      description,
      {
        details,
        severity: "low",
        category: "system"
      }
    );
  }, [logAction]);

  const logComplianceEvent = useCallback((
    eventType: string,
    resourceId: string,
    description: string,
    severity: AuditLogEntry['severity'] = "medium",
    details?: Record<string, any>
  ) => {
    logAction(
      eventType,
      "Compliance",
      resourceId,
      description,
      {
        details,
        severity,
        category: "compliance"
      }
    );
  }, [logAction]);

  return {
    logAction,
    logLogin,
    logLogout,
    logWorkerAction,
    logDocumentAction,
    logScanAction,
    logExportAction,
    logSecurityEvent,
    logSystemEvent,
    logComplianceEvent
  };
};

export default useAuditLogger;