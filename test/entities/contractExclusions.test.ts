import { ContractExclusions, ContractExclusion } from '../../src/entities/contractExclusions';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('ContractExclusions', () => {
  let contractExclusions: ContractExclusions;
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

    contractExclusions = new ContractExclusions(mockAxios, mockLogger);
  });

  describe('create', () => {
    it('should create a contract exclusion', async () => {
      const contractExclusionData: ContractExclusion = {
        contractId: 123,
        exclusionType: 1,
        exclusionValue: 'Service ABC',
        description: 'Exclude this service',
        isActive: true,
      };

      const expectedResponse = { data: { id: 1, ...contractExclusionData } };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractExclusions.create(contractExclusionData);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusions', contractExclusionData);
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByContract', () => {
    it('should get contract exclusions by contract ID', async () => {
      const contractId = 123;
      const expectedResponse = { data: [{ id: 1, contractId, exclusionValue: 'Service ABC' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractExclusions.getByContract(contractId);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusions/query', {
        filter: [{ op: 'eq', field: 'contractId', value: contractId }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getActiveByContract', () => {
    it('should get active contract exclusions by contract ID', async () => {
      const contractId = 123;
      const expectedResponse = { data: [{ id: 1, contractId, isActive: true }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractExclusions.getActiveByContract(contractId);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractExclusions/query', {
        filter: [
          { op: 'eq', field: 'contractId', value: contractId },
          { op: 'eq', field: 'isActive', value: true }
        ]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = ContractExclusions.getMetadata();
      
      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createContractExclusion',
        'getContractExclusion',
        'updateContractExclusion',
        'deleteContractExclusion',
        'listContractExclusions'
      ]);
    });
  });
}); 