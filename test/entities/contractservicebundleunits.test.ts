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
  ContractServiceBundleUnits,
  IContractServiceBundleUnits,
  IContractServiceBundleUnitsQuery,
} from '../../src/entities/contractservicebundleunits';

describe('ContractServiceBundleUnits Entity', () => {
  let contractServiceBundleUnits: ContractServiceBundleUnits;
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

    contractServiceBundleUnits = new ContractServiceBundleUnits(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractservicebundleunits successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceBundleUnits 1' },
        { id: 2, name: 'ContractServiceBundleUnits 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contractServiceBundleUnits.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractServiceBundleUnits/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceBundleUnitsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contractServiceBundleUnits.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractServiceBundleUnits/query',
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
    it('should get contractservicebundleunits by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceBundleUnits' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contractServiceBundleUnits.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractServiceBundleUnits/1'
      );
    });
  });

  describe('create', () => {
    it('should create contractservicebundleunits successfully', async () => {
      const contractServiceBundleUnitsData = {
        name: 'New ContractServiceBundleUnits',
      };
      const mockResponse = { id: 1, ...contractServiceBundleUnitsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractServiceBundleUnits.create(
        contractServiceBundleUnitsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractServiceBundleUnits',
        contractServiceBundleUnitsData
      );
    });
  });

  describe('update', () => {
    it('should update contractservicebundleunits successfully', async () => {
      const contractServiceBundleUnitsData = {
        name: 'Updated ContractServiceBundleUnits',
      };
      const mockResponse = { id: 1, ...contractServiceBundleUnitsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await contractServiceBundleUnits.update(
        1,
        contractServiceBundleUnitsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ContractServiceBundleUnits/1',
        contractServiceBundleUnitsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update contractservicebundleunits successfully', async () => {
      const contractServiceBundleUnitsData = {
        name: 'Patched ContractServiceBundleUnits',
      };
      const mockResponse = { id: 1, ...contractServiceBundleUnitsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractServiceBundleUnits.patch(
        1,
        contractServiceBundleUnitsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ContractServiceBundleUnits/1',
        contractServiceBundleUnitsData
      );
    });
  });

  describe('delete', () => {
    it('should delete contractservicebundleunits successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contractServiceBundleUnits.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ContractServiceBundleUnits/1'
      );
    });
  });
});
