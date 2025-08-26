/**
 * Location service for Autotask location operations
 */

import { AutotaskClient } from 'autotask-node';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('location-service');

export interface LocationCreateData {
  CompanyID: number;
  Name: string;
  Address1: string;
  Address2?: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  Phone?: string;
  Primary?: boolean;
  [key: string]: any;
}

export interface LocationData {
  id: number;
  CompanyID: number;
  Name: string;
  Address1: string;
  Address2?: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  Phone?: string;
  Primary?: boolean;
  CreatedDateTime: string;
  [key: string]: any;
}

export class LocationService {
  private autotaskClient: AutotaskClient;

  constructor(autotaskClient: AutotaskClient) {
    this.autotaskClient = autotaskClient;
  }

  async createLocation(locationData: LocationCreateData): Promise<LocationData> {
    try {
      logger.info(`Creating location: ${locationData.Name} for company ${locationData.CompanyID}`);
      
      this.validateLocationData(locationData);
      
      const response = await this.autotaskClient.create('CompanyLocations', locationData);
      
      if (!response?.items?.[0]) {
        throw new Error('Failed to create location - invalid response');
      }
      
      const createdLocation = response.items[0];
      logger.info(`Location created successfully with ID: ${createdLocation.id}`);
      
      return createdLocation;
      
    } catch (error) {
      logger.error(`Failed to create location ${locationData.Name}:`, error);
      throw error;
    }
  }

  private validateLocationData(locationData: LocationCreateData): void {
    if (!locationData.CompanyID) {
      throw new Error('Company ID is required');
    }

    if (!locationData.Name || locationData.Name.trim().length === 0) {
      throw new Error('Location name is required');
    }

    if (!locationData.Address1 || locationData.Address1.trim().length === 0) {
      throw new Error('Address is required');
    }

    if (!locationData.City || locationData.City.trim().length === 0) {
      throw new Error('City is required');
    }

    if (!locationData.State || locationData.State.trim().length === 0) {
      throw new Error('State is required');
    }
  }
}