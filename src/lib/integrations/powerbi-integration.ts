// Microsoft Power BI Integration
// For reporting, analytics, and business intelligence

import { BaseIntegration, IntegrationConfig, IntegrationResponse } from './base-integration';

export interface PowerBIDataset {
  id: string;
  name: string;
  configuredBy?: string;
  isRefreshable: boolean;
  refreshSchedule?: {
    days: string[];
    times: string[];
    enabled: boolean;
  };
  lastRefresh?: Date;
  tables: PowerBITable[];
}

export interface PowerBITable {
  name: string;
  columns: PowerBIColumn[];
  measures?: PowerBIMeasure[];
}

export interface PowerBIColumn {
  name: string;
  dataType: 'Int64' | 'Double' | 'Boolean' | 'DateTime' | 'String';
  isHidden?: boolean;
  summarizeBy?: 'None' | 'Sum' | 'Average' | 'Count' | 'Min' | 'Max';
}

export interface PowerBIMeasure {
  name: string;
  expression: string;
  formatString?: string;
}

export interface PowerBIReport {
  id: string;
  name: string;
  datasetId: string;
  embedUrl: string;
  pages: PowerBIPage[];
}

export interface PowerBIPage {
  name: string;
  displayName: string;
  order: number;
  isHidden?: boolean;
}

export interface PowerBIRefreshRequest {
  notifyOption: 'MailOnCompletion' | 'MailOnFailure' | 'NoNotification';
}

export interface PowerBIRefreshStatus {
  requestId: string;
  id: string;
  status: 'Unknown' | 'NotStarted' | 'InProgress' | 'Completed' | 'Failed' | 'Disabled';
  startTime?: Date;
  endTime?: Date;
  serviceExceptionJson?: string;
}

export class PowerBIIntegration extends BaseIntegration {
  private accessToken?: string;
  private tokenExpiry?: Date;
  private readonly tenantId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(config: IntegrationConfig & {
    tenantId: string;
    clientId: string;
    clientSecret: string;
  }) {
    super('Microsoft Power BI', config);
    this.tenantId = config.tenantId;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  protected getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async authenticate(): Promise<IntegrationResponse<{ token: string; expiresIn: number }>> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'https://analysis.windows.net/powerbi/api/.default',
      grant_type: 'client_credentials',
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));

      return {
        success: true,
        data: {
          token: data.access_token,
          expiresIn: data.expires_in,
        },
        responseTime: 0, // We'll calculate this properly in a real implementation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        responseTime: 0,
      };
    }
  }

  async testConnection(): Promise<IntegrationResponse> {
    const authResult = await this.authenticate();
    if (!authResult.success) {
      return authResult;
    }

    return this.makeRequest('myorg/datasets');
  }

  // Dataset Management
  async getDatasets(): Promise<IntegrationResponse<PowerBIDataset[]>> {
    await this.ensureAuthenticated();
    return this.makeRequest<PowerBIDataset[]>('myorg/datasets');
  }

  async getDataset(datasetId: string): Promise<IntegrationResponse<PowerBIDataset>> {
    await this.ensureAuthenticated();
    return this.makeRequest<PowerBIDataset>(`myorg/datasets/${datasetId}`);
  }

  async createDataset(dataset: {
    name: string;
    tables: PowerBITable[];
  }): Promise<IntegrationResponse<PowerBIDataset>> {
    await this.ensureAuthenticated();
    return this.makeRequest<PowerBIDataset>('myorg/datasets', {
      method: 'POST',
      body: JSON.stringify(dataset),
    });
  }

  async deleteDataset(datasetId: string): Promise<IntegrationResponse<void>> {
    await this.ensureAuthenticated();
    return this.makeRequest<void>(`myorg/datasets/${datasetId}`, {
      method: 'DELETE',
    });
  }

  // Data Push Operations
  async pushData(
    datasetId: string,
    tableName: string,
    rows: Record<string, unknown>[]
  ): Promise<IntegrationResponse<void>> {
    await this.ensureAuthenticated();
    return this.makeRequest<void>(`myorg/datasets/${datasetId}/tables/${tableName}/rows`, {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });
  }

  async clearTable(datasetId: string, tableName: string): Promise<IntegrationResponse<void>> {
    await this.ensureAuthenticated();
    return this.makeRequest<void>(`myorg/datasets/${datasetId}/tables/${tableName}/rows`, {
      method: 'DELETE',
    });
  }

  // Refresh Operations
  async refreshDataset(
    datasetId: string,
    notifyOption: 'MailOnCompletion' | 'MailOnFailure' | 'NoNotification' = 'NoNotification'
  ): Promise<IntegrationResponse<{ requestId: string }>> {
    await this.ensureAuthenticated();
    
    const result = await this.makeRequest<void>(`myorg/datasets/${datasetId}/refreshes`, {
      method: 'POST',
      body: JSON.stringify({ notifyOption }),
    });

    if (result.success) {
      // Extract requestId from response headers (implementation specific)
      return {
        success: true,
        data: { requestId: 'refresh-request-id' }, // This would be extracted from headers
        responseTime: result.responseTime,
      };
    }

    return {
      success: false,
      error: result.error,
      responseTime: result.responseTime,
    };
  }

  async getRefreshHistory(datasetId: string): Promise<IntegrationResponse<PowerBIRefreshStatus[]>> {
    await this.ensureAuthenticated();
    return this.makeRequest<PowerBIRefreshStatus[]>(`myorg/datasets/${datasetId}/refreshes`);
  }

  async getRefreshStatus(datasetId: string, requestId: string): Promise<IntegrationResponse<PowerBIRefreshStatus>> {
    await this.ensureAuthenticated();
    return this.makeRequest<PowerBIRefreshStatus>(`myorg/datasets/${datasetId}/refreshes/${requestId}`);
  }

  // Report Management
  async getReports(): Promise<IntegrationResponse<PowerBIReport[]>> {
    await this.ensureAuthenticated();
    return this.makeRequest<PowerBIReport[]>('myorg/reports');
  }

  async getReport(reportId: string): Promise<IntegrationResponse<PowerBIReport>> {
    await this.ensureAuthenticated();
    return this.makeRequest<PowerBIReport>(`myorg/reports/${reportId}`);
  }

  // Kestrel Mining Specific Methods
  async createKestrelDatasets(): Promise<IntegrationResponse<{
    workforceDataset: PowerBIDataset;
    equipmentDataset: PowerBIDataset;
    trainingDataset: PowerBIDataset;
  }>> {
    await this.ensureAuthenticated();

    // Workforce Dataset
    const workforceDataset = await this.createDataset({
      name: 'Kestrel Mining Workforce',
      tables: [
        {
          name: 'Workers',
          columns: [
            { name: 'WorkerId', dataType: 'String' },
            { name: 'Name', dataType: 'String' },
            { name: 'EmployeeId', dataType: 'String' },
            { name: 'Status', dataType: 'String' },
            { name: 'Role', dataType: 'String' },
            { name: 'Department', dataType: 'String' },
            { name: 'StartDate', dataType: 'DateTime' },
            { name: 'LastSeen', dataType: 'DateTime' },
          ],
        },
        {
          name: 'ScanHistory',
          columns: [
            { name: 'ScanId', dataType: 'String' },
            { name: 'WorkerId', dataType: 'String' },
            { name: 'Location', dataType: 'String' },
            { name: 'ScannedAt', dataType: 'DateTime' },
            { name: 'Status', dataType: 'String' },
          ],
        },
      ],
    });

    // Equipment Dataset
    const equipmentDataset = await this.createDataset({
      name: 'Kestrel Mining Equipment',
      tables: [
        {
          name: 'Equipment',
          columns: [
            { name: 'EquipmentId', dataType: 'String' },
            { name: 'Name', dataType: 'String' },
            { name: 'Type', dataType: 'String' },
            { name: 'Status', dataType: 'String' },
            { name: 'Location', dataType: 'String' },
            { name: 'DailyRate', dataType: 'Double' },
            { name: 'CurrentHours', dataType: 'Double' },
          ],
        },
        {
          name: 'EquipmentUsage',
          columns: [
            { name: 'UsageId', dataType: 'String' },
            { name: 'EquipmentId', dataType: 'String' },
            { name: 'OperatorType', dataType: 'String' },
            { name: 'StartTime', dataType: 'DateTime' },
            { name: 'EndTime', dataType: 'DateTime' },
            { name: 'HoursUsed', dataType: 'Double' },
            { name: 'FuelUsed', dataType: 'Double' },
          ],
        },
      ],
    });

    // Training Dataset
    const trainingDataset = await this.createDataset({
      name: 'Kestrel Mining Training',
      tables: [
        {
          name: 'TrainingPrograms',
          columns: [
            { name: 'ProgramId', dataType: 'String' },
            { name: 'Name', dataType: 'String' },
            { name: 'Category', dataType: 'String' },
            { name: 'Duration', dataType: 'Int64' },
            { name: 'Cost', dataType: 'Double' },
          ],
        },
        {
          name: 'TrainingEnrollments',
          columns: [
            { name: 'EnrollmentId', dataType: 'String' },
            { name: 'ProgramId', dataType: 'String' },
            { name: 'ParticipantId', dataType: 'String' },
            { name: 'Status', dataType: 'String' },
            { name: 'ProgressPercent', dataType: 'Int64' },
            { name: 'CompletedAt', dataType: 'DateTime' },
          ],
        },
      ],
    });

    if (workforceDataset.success && equipmentDataset.success && trainingDataset.success) {
      return {
        success: true,
        data: {
          workforceDataset: workforceDataset.data!,
          equipmentDataset: equipmentDataset.data!,
          trainingDataset: trainingDataset.data!,
        },
        responseTime: workforceDataset.responseTime + equipmentDataset.responseTime + trainingDataset.responseTime,
      };
    }

    return {
      success: false,
      error: 'Failed to create one or more datasets',
      responseTime: 0,
    };
  }

  async syncWorkforceData(workers: Array<{
    id: string;
    name: string;
    employeeId: string;
    status: string;
    role: string;
    department?: string;
    startDate?: Date;
    lastSeen?: Date;
  }>): Promise<IntegrationResponse<void>> {
    await this.ensureAuthenticated();

    // Find the workforce dataset
    const datasetsResult = await this.getDatasets();
    if (!datasetsResult.success || !datasetsResult.data) {
      return {
        success: false,
        error: 'Failed to retrieve datasets',
        responseTime: datasetsResult.responseTime,
      };
    }

    const workforceDataset = datasetsResult.data.find(ds => ds.name === 'Kestrel Mining Workforce');
    if (!workforceDataset) {
      return {
        success: false,
        error: 'Workforce dataset not found',
        responseTime: datasetsResult.responseTime,
      };
    }

    // Clear existing data
    await this.clearTable(workforceDataset.id, 'Workers');

    // Push new data
    const rows = workers.map(worker => ({
      WorkerId: worker.id,
      Name: worker.name,
      EmployeeId: worker.employeeId,
      Status: worker.status,
      Role: worker.role,
      Department: worker.department || '',
      StartDate: worker.startDate?.toISOString() || null,
      LastSeen: worker.lastSeen?.toISOString() || null,
    }));

    return this.pushData(workforceDataset.id, 'Workers', rows);
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      const authResult = await this.authenticate();
      if (!authResult.success) {
        throw new Error('Power BI authentication failed');
      }
    }
  }
}