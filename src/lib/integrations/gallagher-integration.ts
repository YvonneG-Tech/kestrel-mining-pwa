// Gallagher Command Centre API Integration
// For access control, badge management, and security monitoring

import { BaseIntegration, IntegrationConfig, IntegrationResponse } from './base-integration';

export interface GallagherPerson {
  id: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  department?: string;
  division?: string;
  isActive: boolean;
  lastActivity?: Date;
}

export interface GallagherCard {
  id: string;
  cardNumber: string;
  cardType: string;
  personId: string;
  isActive: boolean;
  issuedDate: Date;
  expiryDate?: Date;
  facilityCode?: string;
}

export interface GallagherEvent {
  id: string;
  eventType: string;
  personId?: string;
  cardNumber?: string;
  location: string;
  timestamp: Date;
  result: 'GRANTED' | 'DENIED' | 'ERROR';
  reason?: string;
}

export interface GallagherAccessGroup {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  members: string[]; // Person IDs
}

export interface GallagherDoor {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  lastHeartbeat?: Date;
  accessGroups: string[];
}

export class GallagherIntegration extends BaseIntegration {
  constructor(config: IntegrationConfig) {
    super('Gallagher Command Centre', config);
  }

  protected getAuthHeaders(): Record<string, string> {
    if (this.config.apiKey) {
      return {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept': 'application/json',
      };
    }
    
    if (this.config.username && this.config.password) {
      const credentials = btoa(`${this.config.username}:${this.config.password}`);
      return {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      };
    }

    return {};
  }

  async testConnection(): Promise<IntegrationResponse> {
    return this.makeRequest('api/system/status');
  }

  // Person Management
  async getPersons(filters?: {
    isActive?: boolean;
    department?: string;
    division?: string;
    search?: string;
  }): Promise<IntegrationResponse<GallagherPerson[]>> {
    const params = new URLSearchParams();
    
    if (filters?.isActive !== undefined) {
      params.append('active', filters.isActive.toString());
    }
    if (filters?.department) {
      params.append('department', filters.department);
    }
    if (filters?.division) {
      params.append('division', filters.division);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const query = params.toString() ? `?${params}` : '';
    return this.makeRequest<GallagherPerson[]>(`api/persons${query}`);
  }

  async getPerson(personId: string): Promise<IntegrationResponse<GallagherPerson>> {
    return this.makeRequest<GallagherPerson>(`api/persons/${personId}`);
  }

  async createPerson(person: Omit<GallagherPerson, 'id'>): Promise<IntegrationResponse<GallagherPerson>> {
    return this.makeRequest<GallagherPerson>('api/persons', {
      method: 'POST',
      body: JSON.stringify(person),
    });
  }

  async updatePerson(personId: string, updates: Partial<GallagherPerson>): Promise<IntegrationResponse<GallagherPerson>> {
    return this.makeRequest<GallagherPerson>(`api/persons/${personId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePerson(personId: string): Promise<IntegrationResponse<void>> {
    return this.makeRequest<void>(`api/persons/${personId}`, {
      method: 'DELETE',
    });
  }

  // Card Management
  async getCards(filters?: {
    personId?: string;
    isActive?: boolean;
    cardType?: string;
  }): Promise<IntegrationResponse<GallagherCard[]>> {
    const params = new URLSearchParams();
    
    if (filters?.personId) {
      params.append('personId', filters.personId);
    }
    if (filters?.isActive !== undefined) {
      params.append('active', filters.isActive.toString());
    }
    if (filters?.cardType) {
      params.append('cardType', filters.cardType);
    }

    const query = params.toString() ? `?${params}` : '';
    return this.makeRequest<GallagherCard[]>(`api/cards${query}`);
  }

  async issueCard(card: Omit<GallagherCard, 'id' | 'issuedDate'>): Promise<IntegrationResponse<GallagherCard>> {
    return this.makeRequest<GallagherCard>('api/cards', {
      method: 'POST',
      body: JSON.stringify({
        ...card,
        issuedDate: new Date().toISOString(),
      }),
    });
  }

  async deactivateCard(cardId: string): Promise<IntegrationResponse<void>> {
    return this.makeRequest<void>(`api/cards/${cardId}/deactivate`, {
      method: 'POST',
    });
  }

  // Event Monitoring
  async getEvents(filters?: {
    personId?: string;
    location?: string;
    eventType?: string;
    fromDate?: Date;
    toDate?: Date;
    result?: 'GRANTED' | 'DENIED' | 'ERROR';
    limit?: number;
  }): Promise<IntegrationResponse<GallagherEvent[]>> {
    const params = new URLSearchParams();
    
    if (filters?.personId) {
      params.append('personId', filters.personId);
    }
    if (filters?.location) {
      params.append('location', filters.location);
    }
    if (filters?.eventType) {
      params.append('eventType', filters.eventType);
    }
    if (filters?.fromDate) {
      params.append('fromDate', filters.fromDate.toISOString());
    }
    if (filters?.toDate) {
      params.append('toDate', filters.toDate.toISOString());
    }
    if (filters?.result) {
      params.append('result', filters.result);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const query = params.toString() ? `?${params}` : '';
    return this.makeRequest<GallagherEvent[]>(`api/events${query}`);
  }

  // Access Group Management
  async getAccessGroups(): Promise<IntegrationResponse<GallagherAccessGroup[]>> {
    return this.makeRequest<GallagherAccessGroup[]>('api/access-groups');
  }

  async addPersonToAccessGroup(groupId: string, personId: string): Promise<IntegrationResponse<void>> {
    return this.makeRequest<void>(`api/access-groups/${groupId}/members/${personId}`, {
      method: 'POST',
    });
  }

  async removePersonFromAccessGroup(groupId: string, personId: string): Promise<IntegrationResponse<void>> {
    return this.makeRequest<void>(`api/access-groups/${groupId}/members/${personId}`, {
      method: 'DELETE',
    });
  }

  // Door Status
  async getDoors(): Promise<IntegrationResponse<GallagherDoor[]>> {
    return this.makeRequest<GallagherDoor[]>('api/doors');
  }

  async getDoorStatus(doorId: string): Promise<IntegrationResponse<GallagherDoor>> {
    return this.makeRequest<GallagherDoor>(`api/doors/${doorId}`);
  }

  // Sync Methods for Integration with Kestrel Mining
  async syncWorkerToGallagher(worker: {
    id: string;
    name: string;
    employeeId: string;
    email?: string;
    phone?: string;
    department?: string;
    status: string;
  }): Promise<IntegrationResponse<GallagherPerson>> {
    const [firstName, ...lastNameParts] = worker.name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const gallagherPerson: Omit<GallagherPerson, 'id'> = {
      firstName,
      lastName,
      employeeId: worker.employeeId,
      email: worker.email,
      phone: worker.phone,
      department: worker.department,
      division: 'Mining Operations',
      isActive: worker.status === 'ACTIVE',
    };

    // Try to find existing person first
    const existingResult = await this.getPersons({
      search: worker.employeeId,
    });

    if (existingResult.success && existingResult.data && existingResult.data.length > 0) {
      // Update existing person
      const existingPerson = existingResult.data[0];
      return this.updatePerson(existingPerson.id, gallagherPerson);
    } else {
      // Create new person
      return this.createPerson(gallagherPerson);
    }
  }

  async getWorkerAccessEvents(employeeId: string, fromDate?: Date): Promise<IntegrationResponse<GallagherEvent[]>> {
    // First find the person by employee ID
    const personResult = await this.getPersons({ search: employeeId });
    
    if (!personResult.success || !personResult.data || personResult.data.length === 0) {
      return {
        success: false,
        error: `No Gallagher person found for employee ID: ${employeeId}`,
        responseTime: 0,
      };
    }

    const person = personResult.data[0];
    
    return this.getEvents({
      personId: person.id,
      fromDate: fromDate || new Date(Date.now() - 24 * 60 * 60 * 1000), // Default to last 24 hours
      eventType: 'ACCESS_ATTEMPT',
    });
  }
}