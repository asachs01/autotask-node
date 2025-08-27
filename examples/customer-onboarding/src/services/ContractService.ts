/**
 * Contract service for Autotask contract operations
 */

import { AutotaskClient } from 'autotask-node';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('contract-service');

export interface ContractCreateData {
  AccountID: number;
  ContractName: string;
  ContractType: number;
  Status: number;
  StartDate: Date;
  EndDate?: Date;
  [key: string]: any;
}

export class ContractService {
  private autotaskClient: AutotaskClient;

  constructor(autotaskClient: AutotaskClient) {
    this.autotaskClient = autotaskClient;
  }

  async createContract(contractData: ContractCreateData): Promise<any> {
    try {
      logger.info(`Creating contract: ${contractData.ContractName}`);
      
      const response = await this.autotaskClient.create('Contracts', contractData);
      
      if (!response?.items?.[0]) {
        throw new Error('Failed to create contract - invalid response');
      }
      
      const createdContract = response.items[0];
      logger.info(`Contract created successfully with ID: ${createdContract.id}`);
      
      return createdContract;
      
    } catch (error) {
      logger.error(`Failed to create contract ${contractData.ContractName}:`, error);
      throw error;
    }
  }
}