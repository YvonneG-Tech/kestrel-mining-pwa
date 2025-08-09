// SAP ERP Integration
// For workforce data synchronization, payroll, and HR management

import { BaseIntegration, IntegrationConfig, IntegrationResponse } from './base-integration';

export interface SAPEmployee {
  pernr: string; // Personnel Number
  firstname: string;
  lastname: string;
  employeeId: string;
  email?: string;
  phone?: string;
  orgunit: string; // Organizational Unit
  position: string;
  costcenter: string;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  payrollArea?: string;
  workSchedule?: string;
}

export interface SAPTimeEntry {
  pernr: string;
  date: Date;
  hours: number;
  attendanceType: string; // Regular, Overtime, Sick, etc.
  costcenter: string;
  project?: string;
  approved: boolean;
  approver?: string;
}

export interface SAPCostCenter {
  id: string;
  name: string;
  description?: string;
  validFrom: Date;
  validTo?: Date;
  responsible?: string;
  company: string;
}

export interface SAPOrganizationalUnit {
  id: string;
  name: string;
  parentId?: string;
  manager?: string;
  costcenter?: string;
  validFrom: Date;
  validTo?: Date;
}

export interface SAPWorkOrder {
  orderNumber: string;
  description: string;
  plant: string;
  costcenter: string;
  status: 'CREATED' | 'RELEASED' | 'TECHNICALLY_COMPLETED' | 'CLOSED';
  startDate: Date;
  endDate?: Date;
  responsible?: string;
  equipment?: string[];
}

export class SAPIntegration extends BaseIntegration {
  private sessionToken?: string;
  private tokenExpiry?: Date;

  constructor(config: IntegrationConfig) {
    super('SAP ERP', config);
  }

  protected getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.sessionToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    } else if (this.config.username && this.config.password) {
      const credentials = btoa(`${this.config.username}:${this.config.password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    return headers;
  }

  async authenticate(): Promise<IntegrationResponse<{ token: string; expiresIn: number }>> {
    const response = await this.makeRequest<{ access_token: string; expires_in: number }>('oauth/token', {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.config.username,
        client_secret: this.config.password,
      }),
    });

    if (response.success && response.data) {
      this.sessionToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return {
        success: true,
        data: {
          token: response.data.access_token,
          expiresIn: response.data.expires_in,
        },
        responseTime: response.responseTime,
      };
    }

    return {
      success: false,
      error: response.error,
      responseTime: response.responseTime,
    };
  }

  async testConnection(): Promise<IntegrationResponse> {
    // First try to authenticate
    const authResult = await this.authenticate();
    if (!authResult.success) {
      return authResult;
    }

    // Then test a simple API call
    return this.makeRequest('api/system/info');
  }

  // Employee Management
  async getEmployees(filters?: {
    orgunit?: string;
    costcenter?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
    modifiedSince?: Date;
  }): Promise<IntegrationResponse<SAPEmployee[]>> {
    await this.ensureAuthenticated();

    const params = new URLSearchParams();
    
    if (filters?.orgunit) {
      params.append('orgunit', filters.orgunit);
    }
    if (filters?.costcenter) {
      params.append('costcenter', filters.costcenter);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.modifiedSince) {
      params.append('modifiedSince', filters.modifiedSince.toISOString());
    }

    const query = params.toString() ? `?${params}` : '';
    return this.makeRequest<SAPEmployee[]>(`api/employees${query}`);
  }

  async getEmployee(pernr: string): Promise<IntegrationResponse<SAPEmployee>> {
    await this.ensureAuthenticated();
    return this.makeRequest<SAPEmployee>(`api/employees/${pernr}`);
  }

  async createEmployee(employee: Omit<SAPEmployee, 'pernr'>): Promise<IntegrationResponse<SAPEmployee>> {
    await this.ensureAuthenticated();
    return this.makeRequest<SAPEmployee>('api/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async updateEmployee(pernr: string, updates: Partial<SAPEmployee>): Promise<IntegrationResponse<SAPEmployee>> {
    await this.ensureAuthenticated();
    return this.makeRequest<SAPEmployee>(`api/employees/${pernr}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Time Entry Management
  async getTimeEntries(filters: {
    pernr?: string;
    fromDate: Date;
    toDate: Date;
    costcenter?: string;
    approved?: boolean;
  }): Promise<IntegrationResponse<SAPTimeEntry[]>> {
    await this.ensureAuthenticated();

    const params = new URLSearchParams();
    params.append('fromDate', filters.fromDate.toISOString().split('T')[0]);
    params.append('toDate', filters.toDate.toISOString().split('T')[0]);
    
    if (filters.pernr) {
      params.append('pernr', filters.pernr);
    }
    if (filters.costcenter) {
      params.append('costcenter', filters.costcenter);
    }
    if (filters.approved !== undefined) {
      params.append('approved', filters.approved.toString());
    }

    return this.makeRequest<SAPTimeEntry[]>(`api/time-entries?${params}`);
  }

  async createTimeEntry(entry: Omit<SAPTimeEntry, 'approved' | 'approver'>): Promise<IntegrationResponse<SAPTimeEntry>> {
    await this.ensureAuthenticated();
    return this.makeRequest<SAPTimeEntry>('api/time-entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  // Cost Center Management
  async getCostCenters(): Promise<IntegrationResponse<SAPCostCenter[]>> {
    await this.ensureAuthenticated();
    return this.makeRequest<SAPCostCenter[]>('api/cost-centers');
  }

  // Organizational Unit Management
  async getOrganizationalUnits(): Promise<IntegrationResponse<SAPOrganizationalUnit[]>> {
    await this.ensureAuthenticated();
    return this.makeRequest<SAPOrganizationalUnit[]>('api/org-units');
  }

  // Work Order Management
  async getWorkOrders(filters?: {
    plant?: string;
    status?: string;
    responsible?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<IntegrationResponse<SAPWorkOrder[]>> {
    await this.ensureAuthenticated();

    const params = new URLSearchParams();
    
    if (filters?.plant) {
      params.append('plant', filters.plant);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.responsible) {
      params.append('responsible', filters.responsible);
    }
    if (filters?.fromDate) {
      params.append('fromDate', filters.fromDate.toISOString().split('T')[0]);
    }
    if (filters?.toDate) {
      params.append('toDate', filters.toDate.toISOString().split('T')[0]);
    }

    const query = params.toString() ? `?${params}` : '';
    return this.makeRequest<SAPWorkOrder[]>(`api/work-orders${query}`);
  }

  // Sync Methods for Integration with Kestrel Mining
  async syncWorkerFromSAP(employeeId: string): Promise<IntegrationResponse<{
    sapEmployee: SAPEmployee;
    syncStatus: 'CREATED' | 'UPDATED' | 'NO_CHANGE';
  }>> {
    await this.ensureAuthenticated();

    // Find employee in SAP by employee ID
    const employeesResult = await this.getEmployees();
    
    if (!employeesResult.success || !employeesResult.data) {
      return {
        success: false,
        error: 'Failed to retrieve SAP employees',
        responseTime: employeesResult.responseTime,
      };
    }

    const sapEmployee = employeesResult.data.find(emp => emp.employeeId === employeeId);
    
    if (!sapEmployee) {
      return {
        success: false,
        error: `Employee with ID ${employeeId} not found in SAP`,
        responseTime: employeesResult.responseTime,
      };
    }

    // Here you would typically sync with your local database
    // For now, we'll return the SAP employee data
    return {
      success: true,
      data: {
        sapEmployee,
        syncStatus: 'NO_CHANGE', // This would be determined by comparing with local data
      },
      responseTime: employeesResult.responseTime,
    };
  }

  async syncTimeEntries(pernr: string, fromDate: Date, toDate: Date): Promise<IntegrationResponse<{
    entries: SAPTimeEntry[];
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
  }>> {
    const result = await this.getTimeEntries({
      pernr,
      fromDate,
      toDate,
      approved: true,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
        responseTime: result.responseTime,
      };
    }

    const entries = result.data;
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const regularHours = entries
      .filter(entry => entry.attendanceType === 'REGULAR')
      .reduce((sum, entry) => sum + entry.hours, 0);
    const overtimeHours = entries
      .filter(entry => entry.attendanceType === 'OVERTIME')
      .reduce((sum, entry) => sum + entry.hours, 0);

    return {
      success: true,
      data: {
        entries,
        totalHours,
        regularHours,
        overtimeHours,
      },
      responseTime: result.responseTime,
    };
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.sessionToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      const authResult = await this.authenticate();
      if (!authResult.success) {
        throw new Error('SAP authentication failed');
      }
    }
  }
}