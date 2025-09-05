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
  ContractServiceBundleAdjustments,
  IContractServiceBundleAdjustments,
  IContractServiceBundleAdjustmentsQuery,
} from '../../src/entities/contractservicebundleadjustments';

describe('ContractServiceBundleAdjustments Entity', () => {
  let contractServiceBundleAdjustments: ContractServiceBundleAdjustments;
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

    contractServiceBundleAdjustments = new ContractServiceBundleAdjustments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractservicebundleadjustments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceBundleAdjustments 1' },
        { id: 2, name: 'ContractServiceBundleAdjustments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractServiceBundleAdjustments.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceBundleAdjustmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractServiceBundleAdjustments.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractservicebundleadjustments by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceBundleAdjustments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractServiceBundleAdjustments.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/1');
    });
  });

  describe('create', () => {
    it('should create contractservicebundleadjustments successfully', async () => {
      const contractServiceBundleAdjustmentsData = { name: 'New ContractServiceBundleAdjustments' };
      const mockResponse = { id: 1, ...contractServiceBundleAdjustmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractServiceBundleAdjustments.create(contractServiceBundleAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractServiceBundleAdjustments', contractServiceBundleAdjustmentsData);
    });
  });

  describe('update', () => {
    it('should update contractservicebundleadjustments successfully', async () => {
      const contractServiceBundleAdjustmentsData = { name: 'Updated ContractServiceBundleAdjustments' };
      const mockResponse = { id: 1, ...contractServiceBundleAdjustmentsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractServiceBundleAdjustments.update(1, contractServiceBundleAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/1', contractServiceBundleAdjustmentsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractservicebundleadjustments successfully', async () => {
      const contractServiceBundleAdjustmentsData = { name: 'Patched ContractServiceBundleAdjustments' };
      const mockResponse = { id: 1, ...contractServiceBundleAdjustmentsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractServiceBundleAdjustments.patch(1, contractServiceBundleAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/1', contractServiceBundleAdjustmentsData);
    });
  });

  describe('delete', () => {
    it('should delete contractservicebundleadjustments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contractServiceBundleAdjustments.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractServiceBundleAdjustments/1');
    });
  });
});