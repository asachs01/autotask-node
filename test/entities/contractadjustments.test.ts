import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import {
  ContractAdjustments,
  ContractAdjustment,
  ContractAdjustmentQuery,
} from '../../src/entities/contractadjustments';

describe('ContractAdjustments Entity', () => {
  let contractAdjustments: ContractAdjustments;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    } as any;

    mockLogger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })],
    });

    contractAdjustments = new ContractAdjustments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractadjustments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractAdjustment 1' },
        { id: 2, name: 'ContractAdjustment 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractAdjustments.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractAdjustments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ContractAdjustmentQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractAdjustments.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractAdjustments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractadjustment by id', async () => {
      const mockData = { id: 1, name: 'Test ContractAdjustment' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractAdjustments.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractAdjustments/1');
    });
  });

  describe('create', () => {
    it('should create contractadjustment successfully', async () => {
      const contractAdjustmentData = { name: 'New ContractAdjustment' };
      const mockResponse = { id: 1, ...contractAdjustmentData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractAdjustments.create(contractAdjustmentData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractAdjustments', contractAdjustmentData);
    });
  });

  describe('update', () => {
    it('should update contractadjustment successfully', async () => {
      const contractAdjustmentData = { name: 'Updated ContractAdjustment' };
      const mockResponse = { id: 1, ...contractAdjustmentData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractAdjustments.update(1, contractAdjustmentData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractAdjustments/1', contractAdjustmentData);
    });
  });

  describe('patch', () => {
    it('should partially update contractadjustment successfully', async () => {
      const contractAdjustmentData = { name: 'Patched ContractAdjustment' };
      const mockResponse = { id: 1, ...contractAdjustmentData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractAdjustments.patch(1, contractAdjustmentData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractAdjustments/1', contractAdjustmentData);
    });
  });
});