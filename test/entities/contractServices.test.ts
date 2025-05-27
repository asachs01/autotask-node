import { ContractServices, ContractService } from '../../src/entities/contractServices';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('ContractServices', () => {
  let contractServices: ContractServices;
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

    contractServices = new ContractServices(mockAxios, mockLogger);
  });

  describe('create', () => {
    it('should create a contract service', async () => {
      const contractServiceData: ContractService = {
        contractId: 123,
        serviceId: 456,
        unitPrice: 100.00,
        quantity: 1,
      };

      const expectedResponse = { data: { id: 1, ...contractServiceData } };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractServices.create(contractServiceData);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractServices', contractServiceData);
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByContract', () => {
    it('should get contract services by contract ID', async () => {
      const contractId = 123;
      const expectedResponse = { data: [{ id: 1, contractId, serviceId: 456 }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractServices.getByContract(contractId);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractServices/query', {
        filter: [{ op: 'eq', field: 'contractId', value: contractId }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = ContractServices.getMetadata();
      
      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createContractService',
        'getContractService',
        'updateContractService',
        'deleteContractService',
        'listContractServices'
      ]);
    });
  });
}); 