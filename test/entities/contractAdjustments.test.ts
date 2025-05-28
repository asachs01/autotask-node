import {
  ContractAdjustments,
  ContractAdjustment,
} from '../../src/entities/contractAdjustments';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  createMockAxios,
  createMockLogger,
  createTestRequestHandler,
} from '../utils/testHelpers';

describe('ContractAdjustments', () => {
  let contractAdjustments: ContractAdjustments;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);
    contractAdjustments = new ContractAdjustments(
      mockAxios,
      mockLogger,
      testRequestHandler
    );
  });

  describe('create', () => {
    it('should create a contract adjustment', async () => {
      const contractAdjustmentData: ContractAdjustment = {
        contractId: 123,
        adjustmentType: 1,
        adjustmentValue: 50.0,
        effectiveDate: '2024-01-01',
        description: 'Test adjustment',
        isActive: true,
      };

      const expectedResponse = { data: { id: 1, ...contractAdjustmentData } };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractAdjustments.create(contractAdjustmentData);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractAdjustments',
        contractAdjustmentData
      );
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByContract', () => {
    it('should get contract adjustments by contract ID', async () => {
      const contractId = 123;
      const expectedResponse = {
        data: [{ id: 1, contractId, adjustmentValue: 50.0 }],
      };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractAdjustments.getByContract(contractId);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractAdjustments/query',
        {
          filter: [{ op: 'eq', field: 'contractId', value: contractId }],
        }
      );
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getActiveByContract', () => {
    it('should get active contract adjustments by contract ID', async () => {
      const contractId = 123;
      const expectedResponse = {
        data: [{ id: 1, contractId, isActive: true }],
      };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await contractAdjustments.getActiveByContract(contractId);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractAdjustments/query',
        {
          filter: [
            { op: 'eq', field: 'contractId', value: contractId },
            { op: 'eq', field: 'isActive', value: true },
          ],
        }
      );
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = ContractAdjustments.getMetadata();

      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createContractAdjustment',
        'getContractAdjustment',
        'updateContractAdjustment',
        'deleteContractAdjustment',
        'listContractAdjustments',
      ]);
    });
  });
});
