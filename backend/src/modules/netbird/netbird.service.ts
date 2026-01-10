import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NetBirdService {
  private readonly apiBase: string;
  private readonly apiToken: string;

  constructor(private configService: ConfigService) {
    this.apiBase = this.configService.get<string>('netbird.apiBase') || '';
    this.apiToken = this.configService.get<string>('netbird.apiToken') || '';
  }

  private async makeRequest(endpoint: string, options?: any) {
    try {
      const response = await axios({
        method: options?.method || 'GET',
        url: `${this.apiBase}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      return response.data;
    } catch (error) {
      throw new Error(`NetBird API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPeers() {
    return this.makeRequest('/peers');
  }

  async getUsers() {
    return this.makeRequest('/users');
  }

  async getGroups() {
    return this.makeRequest('/groups');
  }

  async getPolicies() {
    return this.makeRequest('/policies');
  }

  async getSetupKeys() {
    return this.makeRequest('/setup-keys');
  }

  async getEvents() {
    return this.makeRequest('/events');
  }
}