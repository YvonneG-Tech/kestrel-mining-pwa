// Base integration class for external API connections

export interface IntegrationConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface IntegrationResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  responseTime: number;
}

export abstract class BaseIntegration {
  protected config: IntegrationConfig;
  protected name: string;

  constructor(name: string, config: IntegrationConfig) {
    this.name = name;
    this.config = config;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<IntegrationResponse<T>> {
    const startTime = Date.now();
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        statusCode: response.status,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (attempt < this.config.retryAttempts) {
        console.warn(`${this.name} API request failed (attempt ${attempt}/${this.config.retryAttempts}):`, error);
        await this.delay(this.config.retryDelay);
        return this.makeRequest<T>(endpoint, options, attempt + 1);
      }

      console.error(`${this.name} API request failed after ${attempt} attempts:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      };
    }
  }

  protected abstract getAuthHeaders(): Record<string, string>;

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  abstract testConnection(): Promise<IntegrationResponse>;
}

// Integration status tracking
export interface IntegrationStatus {
  name: string;
  isConnected: boolean;
  lastChecked: Date;
  lastError?: string;
  responseTime?: number;
  version?: string;
}

export class IntegrationManager {
  private integrations = new Map<string, BaseIntegration>();
  private statuses = new Map<string, IntegrationStatus>();

  register(name: string, integration: BaseIntegration): void {
    this.integrations.set(name, integration);
    this.statuses.set(name, {
      name,
      isConnected: false,
      lastChecked: new Date(),
    });
  }

  async checkAllConnections(): Promise<Map<string, IntegrationStatus>> {
    const results = new Map<string, IntegrationStatus>();

    for (const [name, integration] of this.integrations) {
      const result = await integration.testConnection();
      const status: IntegrationStatus = {
        name,
        isConnected: result.success,
        lastChecked: new Date(),
        lastError: result.error,
        responseTime: result.responseTime,
      };
      
      this.statuses.set(name, status);
      results.set(name, status);
    }

    return results;
  }

  getIntegration(name: string): BaseIntegration | undefined {
    return this.integrations.get(name);
  }

  getStatus(name: string): IntegrationStatus | undefined {
    return this.statuses.get(name);
  }

  getAllStatuses(): Map<string, IntegrationStatus> {
    return new Map(this.statuses);
  }
}