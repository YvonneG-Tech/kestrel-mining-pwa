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

  // Contractors API
  async getContractors(filters?: {
    status?: string;
    search?: string;
    available?: boolean;
    skills?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.available) params.append('available', filters.available.toString());
    if (filters?.skills) params.append('skills', filters.skills);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/contractors${query}`);
  }

  async getContractor(id: string) {
    return this.request(`/contractors/${id}`);
  }

  async createContractor(data: {
    companyName: string;
    abn?: string;
    contactName: string;
    email: string;
    phone: string;
    address?: string;
    status?: string;
    hourlyRate?: number;
    dailyRate?: number;
    emergencyRate?: number;
    skills?: string[];
    isAvailable?: boolean;
    availableFrom?: string;
    availableTo?: string;
    maxHoursPerWeek?: number;
  }) {
    return this.request('/contractors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContractor(id: string, data: Partial<{
    companyName: string;
    abn: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    hourlyRate: number;
    dailyRate: number;
    emergencyRate: number;
    skills: string[];
    isAvailable: boolean;
    availableFrom: string;
    availableTo: string;
    maxHoursPerWeek: number;
  }>) {
    return this.request(`/contractors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContractor(id: string) {
    return this.request(`/contractors/${id}`, {
      method: 'DELETE',
    });
  }

  // Equipment API
  async getEquipment(filters?: {
    type?: string;
    status?: string;
    search?: string;
    available?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.available) params.append('available', filters.available.toString());
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/equipment${query}`);
  }

  async getEquipmentItem(id: string) {
    return this.request(`/equipment/${id}`);
  }

  async createEquipment(data: {
    name: string;
    type: string;
    model?: string;
    serialNumber?: string;
    registrationId?: string;
    status?: string;
    specifications?: Record<string, unknown>;
    capacity?: string;
    fuelType?: string;
    isOwned?: boolean;
    purchaseDate?: string;
    purchasePrice?: number;
    currentValue?: number;
    dailyRate?: number;
    currentLocation?: string;
    isAvailable?: boolean;
    serviceIntervalKm?: number;
    serviceIntervalHours?: number;
    currentKm?: number;
    currentHours?: number;
  }) {
    return this.request('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEquipment(id: string, data: Partial<{
    name: string;
    type: string;
    model: string;
    serialNumber: string;
    registrationId: string;
    status: string;
    specifications: Record<string, unknown>;
    capacity: string;
    fuelType: string;
    isOwned: boolean;
    purchaseDate: string;
    purchasePrice: number;
    currentValue: number;
    dailyRate: number;
    currentLocation: string;
    isAvailable: boolean;
    serviceIntervalKm: number;
    serviceIntervalHours: number;
    currentKm: number;
    currentHours: number;
  }>) {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEquipment(id: string) {
    return this.request(`/equipment/${id}`, {
      method: 'DELETE',
    });
  }

  // Equipment Usage API
  async getEquipmentUsage(filters?: {
    equipmentId?: string;
    workerId?: string;
    contractorId?: string;
    active?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);
    if (filters?.workerId) params.append('workerId', filters.workerId);
    if (filters?.contractorId) params.append('contractorId', filters.contractorId);
    if (filters?.active) params.append('active', filters.active.toString());
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/equipment/usage${query}`);
  }

  async createEquipmentUsage(data: {
    equipmentId: string;
    operatorType: 'EMPLOYEE' | 'CONTRACTOR';
    workerId?: string;
    contractorId?: string;
    startTime: string;
    endTime?: string;
    location?: string;
    purpose?: string;
    startKm?: number;
    endKm?: number;
    startHours?: number;
    endHours?: number;
    fuelUsed?: number;
    notes?: string;
  }) {
    return this.request('/equipment/usage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;