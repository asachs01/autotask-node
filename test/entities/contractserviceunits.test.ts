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
  ContractServiceUnits,
  IContractServiceUnits,
  IContractServiceUnitsQuery,
} from '../../src/entities/contractserviceunits';

describe('ContractServiceUnits Entity', () => {
  let contractServiceUnits: ContractServiceUnits;
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

    contractServiceUnits = new ContractServiceUnits(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractserviceunits successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceUnits 1' },
        { id: 2, name: 'ContractServiceUnits 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractServiceUnits.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractServiceUnits/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceUnitsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractServiceUnits.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractServiceUnits/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractserviceunits by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceUnits' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractServiceUnits.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractServiceUnits/1');
    });
  });

  describe('create', () => {
    it('should create contractserviceunits successfully', async () => {
      const contractServiceUnitsData = { name: 'New ContractServiceUnits' };
      const mockResponse = { id: 1, ...contractServiceUnitsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractServiceUnits.create(contractServiceUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractServiceUnits', contractServiceUnitsData);
    });
  });

  describe('update', () => {
    it('should update contractserviceunits successfully', async () => {
      const contractServiceUnitsData = { name: 'Updated ContractServiceUnits' };
      const mockResponse = { id: 1, ...contractServiceUnitsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractServiceUnits.update(1, contractServiceUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractServiceUnits/1', contractServiceUnitsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractserviceunits successfully', async () => {
      const contractServiceUnitsData = { name: 'Patched ContractServiceUnits' };
      const mockResponse = { id: 1, ...contractServiceUnitsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractServiceUnits.patch(1, contractServiceUnitsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractServiceUnits/1', contractServiceUnitsData);
    });
  });

  describe('delete', () => {
    it('should delete contractserviceunits successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contractServiceUnits.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractServiceUnits/1');
    });
  });
});