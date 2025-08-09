// API client utilities for the Kestrel Mining PWA

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : 'http://localhost:3000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Workers API
  async getWorkers(filters?: {
    status?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/workers${query}`);
  }

  async getWorker(id: string) {
    return this.request(`/workers/${id}`);
  }

  async createWorker(data: {
    name: string;
    employeeId: string;
    email?: string;
    phone?: string;
    role: string;
    department?: string;
    status?: string;
  }) {
    return this.request('/workers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorker(id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    status: string;
  }>) {
    return this.request(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorker(id: string) {
    return this.request(`/workers/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents API
  async getDocuments(filters?: {
    type?: string;
    status?: string;
    workerId?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.workerId) params.append('workerId', filters.workerId);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/documents${query}`);
  }

  async createDocument(data: {
    name: string;
    type: string;
    description?: string;
    workerId?: string;
    expiryDate?: string;
    fileName?: string;
    fileSize?: number;
  }) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Scanner API
  async recordScan(data: {
    workerId: string;
    status: 'SUCCESS' | 'ERROR' | 'NOT_FOUND';
    location?: string;
    qrData?: Record<string, unknown>;
  }) {
    return this.request('/scanner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getScanHistory(filters?: {
    workerId?: string;
    status?: string;
    location?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.workerId) params.append('workerId', filters.workerId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/scanner${query}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;