import { Contracts, Contract } from '../../src/entities/contracts';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  createMockAxios,
  createMockLogger,
  createTestRequestHandler,
} from '../utils/testHelpers';

describe('Contracts', () => {
  let contracts: Contracts;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);
    contracts = new Contracts(mockAxios, mockLogger, testRequestHandler);
  });

  describe('create', () => {
    it('should create a contract', async () => {
      const contractData: Contract = {
        accountId: 123,
        contractName: 'Test Contract',
        contractType: 1,
        status: 1,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const expectedResponse = { data: { id: 1, ...contractData } };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contracts.create(contractData);

      expect(mockAxios.post).toHaveBeenCalledWith('/Contracts', contractData);
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle create errors', async () => {
      const contractData: Contract = { accountId: 123 };
      mockAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(contracts.create(contractData)).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should get a contract by id', async () => {
      const contractId = 1;
      const expectedResponse = {
        data: { id: contractId, contractName: 'Test Contract' },
      };
      mockAxios.get.mockResolvedValue(expectedResponse);

      const result = await contracts.get(contractId);

      expect(mockAxios.get).toHaveBeenCalledWith('/Contracts/1');
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle get errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Not Found'));

      await expect(contracts.get(999)).rejects.toThrow('Not Found');
    });
  });

  describe('update', () => {
    it('should update a contract', async () => {
      const contractId = 1;
      const updateData: Partial<Contract> = {
        contractName: 'Updated Contract',
      };
      const expectedResponse = { data: { id: contractId, ...updateData } };
      mockAxios.put.mockResolvedValue(expectedResponse);

      const result = await contracts.update(contractId, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith('/Contracts/1', updateData);
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle update errors', async () => {
      mockAxios.put.mockRejectedValue(new Error('Update Failed'));

      await expect(contracts.update(1, {})).rejects.toThrow('Update Failed');
    });
  });

  describe('delete', () => {
    it('should delete a contract', async () => {
      const contractId = 1;
      mockAxios.delete.mockResolvedValue({ data: {} });

      await contracts.delete(contractId);

      expect(mockAxios.delete).toHaveBeenCalledWith('/Contracts/1');
    });

    it('should handle delete errors', async () => {
      mockAxios.delete.mockRejectedValue(new Error('Delete Failed'));

      await expect(contracts.delete(1)).rejects.toThrow('Delete Failed');
    });
  });

  describe('list', () => {
    it('should list contracts with default filter', async () => {
      const expectedResponse = {
        data: [{ id: 1, contractName: 'Contract 1' }],
      };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contracts.list();

      expect(mockAxios.post).toHaveBeenCalledWith('/Contracts/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should list contracts with custom filter', async () => {
      const query = { filter: { accountId: 123 }, page: 1, pageSize: 10 };
      const expectedResponse = { data: [{ id: 1, accountId: 123 }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contracts.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/Contracts/query', {
        filter: [{ op: 'eq', field: 'accountId', value: 123 }],
        page: 1,
        pageSize: 10,
      });
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle list errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('List Failed'));

      await expect(contracts.list()).rejects.toThrow('List Failed');
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = Contracts.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createContract',
        'getContract',
        'updateContract',
        'deleteContract',
        'listContracts',
      ]);
    });
  });
});
