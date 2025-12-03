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
  ContractServiceBundles,
  IContractServiceBundles,
  IContractServiceBundlesQuery,
} from '../../src/entities/contractservicebundles';

describe('ContractServiceBundles Entity', () => {
  let contractServiceBundles: ContractServiceBundles;
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

    contractServiceBundles = new ContractServiceBundles(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractservicebundles successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceBundles 1' },
        { id: 2, name: 'ContractServiceBundles 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contractServiceBundles.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractServiceBundles/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceBundlesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contractServiceBundles.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractServiceBundles/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get contractservicebundles by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceBundles' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contractServiceBundles.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractServiceBundles/1');
    });
  });

  describe('create', () => {
    it('should create contractservicebundles successfully', async () => {
      const contractServiceBundlesData = { name: 'New ContractServiceBundles' };
      const mockResponse = { id: 1, ...contractServiceBundlesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractServiceBundles.create(
        contractServiceBundlesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractServiceBundles',
        contractServiceBundlesData
      );
    });
  });

  describe('update', () => {
    it('should update contractservicebundles successfully', async () => {
      const contractServiceBundlesData = {
        name: 'Updated ContractServiceBundles',
      };
      const mockResponse = { id: 1, ...contractServiceBundlesData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await contractServiceBundles.update(
        1,
        contractServiceBundlesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ContractServiceBundles/1',
        contractServiceBundlesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update contractservicebundles successfully', async () => {
      const contractServiceBundlesData = {
        name: 'Patched ContractServiceBundles',
      };
      const mockResponse = { id: 1, ...contractServiceBundlesData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractServiceBundles.patch(
        1,
        contractServiceBundlesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ContractServiceBundles/1',
        contractServiceBundlesData
      );
    });
  });

  describe('delete', () => {
    it('should delete contractservicebundles successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contractServiceBundles.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ContractServiceBundles/1'
      );
    });
  });
});
