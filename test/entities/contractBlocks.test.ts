import { ContractBlocks, ContractBlock } from '../../src/entities/contractBlocks';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('ContractBlocks', () => {
  let contractBlocks: ContractBlocks;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockAxios = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    contractBlocks = new ContractBlocks(mockAxios, mockLogger);
  });

  describe('create', () => {
    it('should create a contract block', async () => {
      const contractBlockData: ContractBlock = {
        contractId: 123,
        dateBegin: '2024-01-01',
        dateEnd: '2024-01-31',
        hours: 40,
        status: 1,
      };

      const expectedResponse = { data: { id: 1, ...contractBlockData } };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractBlocks.create(contractBlockData);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractBlocks', contractBlockData);
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByContract', () => {
    it('should get contract blocks by contract ID', async () => {
      const contractId = 123;
      const expectedResponse = { data: [{ id: 1, contractId, hours: 40 }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractBlocks.getByContract(contractId);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractBlocks/query', {
        filter: [{ op: 'eq', field: 'contractId', value: contractId }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByDateRange', () => {
    it('should get contract blocks by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const expectedResponse = { data: [{ id: 1, dateBegin: startDate, dateEnd: endDate }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractBlocks.getByDateRange(startDate, endDate);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractBlocks/query', {
        filter: [
          { op: 'gte', field: 'dateBegin', value: startDate },
          { op: 'lte', field: 'dateEnd', value: endDate }
        ]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = ContractBlocks.getMetadata();
      
      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createContractBlock',
        'getContractBlock',
        'updateContractBlock',
        'deleteContractBlock',
        'listContractBlocks'
      ]);
    });
  });
}); 