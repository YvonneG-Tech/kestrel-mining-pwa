// Integration Manager for coordinating all external API integrations

import { IntegrationManager, IntegrationStatus } from './base-integration';
import { GallagherIntegration } from './gallagher-integration';
import { SAPIntegration } from './sap-integration';
import { PowerBIIntegration } from './powerbi-integration';

// Configuration interfaces
interface GallagherConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

interface SAPConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  timeout?: number;
}

interface PowerBIConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  timeout?: number;
}

interface IntegrationsConfig {
  gallagher?: GallagherConfig;
  sap?: SAPConfig;
  powerbi?: PowerBIConfig;
}

export class KestrelIntegrationManager {
  private manager: IntegrationManager;
  private gallagher?: GallagherIntegration;
  private sap?: SAPIntegration;
  private powerbi?: PowerBIIntegration;

  constructor(config: IntegrationsConfig) {
    this.manager = new IntegrationManager();
    this.initializeIntegrations(config);
  }

  private initializeIntegrations(config: IntegrationsConfig): void {
    // Initialize Gallagher integration
    if (config.gallagher) {
      this.gallagher = new GallagherIntegration({
        baseUrl: config.gallagher.baseUrl,
        apiKey: config.gallagher.apiKey,
        timeout: config.gallagher.timeout || 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      });
      this.manager.register('gallagher', this.gallagher);
    }

    // Initialize SAP integration
    if (config.sap) {
      this.sap = new SAPIntegration({
        baseUrl: config.sap.baseUrl,
        username: config.sap.clientId,
        password: config.sap.clientSecret,
        timeout: config.sap.timeout || 45000,
        retryAttempts: 3,
        retryDelay: 2000,
      });
      this.manager.register('sap', this.sap);
    }

    // Initialize Power BI integration
    if (config.powerbi) {
      this.powerbi = new PowerBIIntegration({
        baseUrl: 'https://api.powerbi.com/v1.0/',
        tenantId: config.powerbi.tenantId,
        clientId: config.powerbi.clientId,
        clientSecret: config.powerbi.clientSecret,
        timeout: config.powerbi.timeout || 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      });
      this.manager.register('powerbi', this.powerbi);
    }
  }

  // Convenience getters
  getGallagher(): GallagherIntegration | undefined {
    return this.gallagher;
  }

  getSAP(): SAPIntegration | undefined {
    return this.sap;
  }

  getPowerBI(): PowerBIIntegration | undefined {
    return this.powerbi;
  }

  // Health check methods
  async checkAllConnections(): Promise<Map<string, IntegrationStatus>> {
    return this.manager.checkAllConnections();
  }

  async getHealthStatus(): Promise<{
    overall: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    integrations: Record<string, IntegrationStatus>;
    summary: {
      total: number;
      connected: number;
      disconnected: number;
    };
  }> {
    const statuses = await this.checkAllConnections();
    const statusArray = Array.from(statuses.values());
    
    const connected = statusArray.filter(s => s.isConnected).length;
    const total = statusArray.length;
    const disconnected = total - connected;

    let overall: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    if (connected === total) {
      overall = 'HEALTHY';
    } else if (connected > 0) {
      overall = 'DEGRADED';
    } else {
      overall = 'UNHEALTHY';
    }

    const integrations: Record<string, IntegrationStatus> = {};
    for (const [name, status] of statuses) {
      integrations[name] = status;
    }

    return {
      overall,
      integrations,
      summary: {
        total,
        connected,
        disconnected,
      },
    };
  }

  // Sync operations
  async syncWorkerToGallagher(worker: {
    id: string;
    name: string;
    employeeId: string;
    email?: string;
    phone?: string;
    department?: string;
    status: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.gallagher) {
      return { success: false, error: 'Gallagher integration not configured' };
    }

    try {
      const result = await this.gallagher.syncWorkerToGallagher(worker);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async syncWorkerFromSAP(employeeId: string): Promise<{
    success: boolean;
    data?: {
      firstName: string;
      lastName: string;
      employeeId: string;
      email?: string;
      department?: string;
      position: string;
      status: string;
    };
    error?: string;
  }> {
    if (!this.sap) {
      return { success: false, error: 'SAP integration not configured' };
    }

    try {
      const result = await this.sap.syncWorkerFromSAP(employeeId);
      
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const sapEmployee = result.data.sapEmployee;
      
      return {
        success: true,
        data: {
          firstName: sapEmployee.firstname,
          lastName: sapEmployee.lastname,
          employeeId: sapEmployee.employeeId,
          email: sapEmployee.email,
          department: sapEmployee.orgunit,
          position: sapEmployee.position,
          status: sapEmployee.status,
        },
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async syncWorkforceToPowerBI(workers: Array<{
    id: string;
    name: string;
    employeeId: string;
    status: string;
    role: string;
    department?: string;
    startDate?: Date;
    lastSeen?: Date;
  }>): Promise<{ success: boolean; error?: string }> {
    if (!this.powerbi) {
      return { success: false, error: 'Power BI integration not configured' };
    }

    try {
      const result = await this.powerbi.syncWorkforceData(workers);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Batch sync operations
  async performFullSync(workers: Array<{
    id: string;
    name: string;
    employeeId: string;
    email?: string;
    phone?: string;
    department?: string;
    status: string;
    role: string;
    startDate?: Date;
    lastSeen?: Date;
  }>): Promise<{
    gallagher?: { success: boolean; synced: number; errors: string[] };
    sap?: { success: boolean; synced: number; errors: string[] };
    powerbi?: { success: boolean; error?: string };
    overall: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  }> {
    const results: {
      gallagher?: { success: boolean; synced: number; errors: string[] };
      sap?: { success: boolean; synced: number; errors: string[] };
      powerbi?: { success: boolean; error?: string };
      overall: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    } = { overall: 'SUCCESS' };

    // Sync to Gallagher
    if (this.gallagher) {
      const gallagherResults = {
        success: true,
        synced: 0,
        errors: [] as string[],
      };

      for (const worker of workers) {
        try {
          const result = await this.gallagher.syncWorkerToGallagher(worker);
          if (result.success) {
            gallagherResults.synced++;
          } else {
            gallagherResults.errors.push(`${worker.employeeId}: ${result.error}`);
          }
        } catch (error) {
          gallagherResults.errors.push(
            `${worker.employeeId}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      gallagherResults.success = gallagherResults.errors.length === 0;
      results.gallagher = gallagherResults;
    }

    // Sync to Power BI
    if (this.powerbi) {
      const powerbiResult = await this.syncWorkforceToPowerBI(workers);
      results.powerbi = powerbiResult;
    }

    // Determine overall status
    const hasErrors = (results.gallagher && !results.gallagher.success) ||
                     (results.powerbi && !results.powerbi.success);
    
    const hasSuccess = (results.gallagher && results.gallagher.synced > 0) ||
                      (results.powerbi && results.powerbi.success);

    if (hasErrors && hasSuccess) {
      results.overall = 'PARTIAL';
    } else if (hasErrors) {
      results.overall = 'FAILED';
    }

    return results;
  }
}

// Singleton instance for the application
let integrationManager: KestrelIntegrationManager | null = null;

export function getIntegrationManager(): KestrelIntegrationManager {
  if (!integrationManager) {
    const config: IntegrationsConfig = {
      // These would typically come from environment variables
      gallagher: process.env.GALLAGHER_API_URL ? {
        baseUrl: process.env.GALLAGHER_API_URL,
        apiKey: process.env.GALLAGHER_API_KEY || '',
      } : undefined,
      
      sap: process.env.SAP_API_URL ? {
        baseUrl: process.env.SAP_API_URL,
        clientId: process.env.SAP_CLIENT_ID || '',
        clientSecret: process.env.SAP_CLIENT_SECRET || '',
      } : undefined,
      
      powerbi: process.env.POWERBI_TENANT_ID ? {
        tenantId: process.env.POWERBI_TENANT_ID,
        clientId: process.env.POWERBI_CLIENT_ID || '',
        clientSecret: process.env.POWERBI_CLIENT_SECRET || '',
      } : undefined,
    };

    integrationManager = new KestrelIntegrationManager(config);
  }

  return integrationManager;
}