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

  // Training Programs API
  async getTrainingPrograms(filters?: {
    category?: string;
    search?: string;
    provider?: string;
    deliveryMethod?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.provider) params.append('provider', filters.provider);
    if (filters?.deliveryMethod) params.append('deliveryMethod', filters.deliveryMethod);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/training/programs${query}`);
  }

  async getTrainingProgram(id: string) {
    return this.request(`/training/programs/${id}`);
  }

  async createTrainingProgram(data: {
    name: string;
    description?: string;
    category: string;
    provider?: string;
    duration: number;
    validityPeriod?: number;
    isRecurring?: boolean;
    renewalRequired?: boolean;
    prerequisites?: string[];
    minExperience?: number;
    deliveryMethod?: string;
    materials?: Record<string, unknown>;
    assessmentType?: string;
    passingScore?: number;
    cost?: number;
    maxParticipants?: number;
  }) {
    return this.request('/training/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrainingProgram(id: string, data: Partial<{
    name: string;
    description: string;
    category: string;
    provider: string;
    duration: number;
    validityPeriod: number;
    isRecurring: boolean;
    renewalRequired: boolean;
    prerequisites: string[];
    minExperience: number;
    deliveryMethod: string;
    materials: Record<string, unknown>;
    assessmentType: string;
    passingScore: number;
    cost: number;
    maxParticipants: number;
  }>) {
    return this.request(`/training/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrainingProgram(id: string) {
    return this.request(`/training/programs/${id}`, {
      method: 'DELETE',
    });
  }

  // Training Enrollments API
  async getTrainingEnrollments(filters?: {
    programId?: string;
    workerId?: string;
    contractorId?: string;
    status?: string;
    priority?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.programId) params.append('programId', filters.programId);
    if (filters?.workerId) params.append('workerId', filters.workerId);
    if (filters?.contractorId) params.append('contractorId', filters.contractorId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/training/enrollments${query}`);
  }

  async createTrainingEnrollment(data: {
    trainingProgramId: string;
    participantType: 'EMPLOYEE' | 'CONTRACTOR';
    workerId?: string;
    contractorId?: string;
    status?: string;
    priority?: string;
    deadline?: string;
    progressPercent?: number;
    startedAt?: string;
    completedAt?: string;
    finalScore?: number;
    passed?: boolean;
    certificateIssued?: boolean;
    notes?: string;
  }) {
    return this.request('/training/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Skills API
  async getSkills(filters?: {
    category?: string;
    level?: string;
    search?: string;
    requiresCertification?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.requiresCertification !== undefined) params.append('requiresCertification', filters.requiresCertification.toString());
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/skills${query}`);
  }

  async createSkill(data: {
    name: string;
    description?: string;
    category: string;
    level?: string;
    requiresCertification?: boolean;
    certificationAuthority?: string;
    validityPeriod?: number;
  }) {
    return this.request('/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Worker Skills API
  async getWorkerSkills(filters?: {
    workerId?: string;
    skillId?: string;
    verified?: boolean;
    certified?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.workerId) params.append('workerId', filters.workerId);
    if (filters?.skillId) params.append('skillId', filters.skillId);
    if (filters?.verified !== undefined) params.append('verified', filters.verified.toString());
    if (filters?.certified !== undefined) params.append('certified', filters.certified.toString());
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/skills/worker${query}`);
  }

  async createWorkerSkill(data: {
    workerId: string;
    skillId: string;
    level: string;
    experienceYears?: number;
    lastUsed?: string;
    verified?: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    certified?: boolean;
    certificationDate?: string;
    expiryDate?: string;
    certificationNumber?: string;
    notes?: string;
  }) {
    return this.request('/skills/worker', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Skills Matrix API
  async getSkillsMatrix(filters?: {
    department?: string;
    role?: string;
    skillCategory?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.skillCategory) params.append('skillCategory', filters.skillCategory);
    
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/skills/matrix${query}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;