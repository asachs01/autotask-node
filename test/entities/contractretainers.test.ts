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
  ContractRetainers,
  IContractRetainers,
  IContractRetainersQuery,
} from '../../src/entities/contractretainers';

describe('ContractRetainers Entity', () => {
  let contractRetainers: ContractRetainers;
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

    contractRetainers = new ContractRetainers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractretainers successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractRetainers 1' },
        { id: 2, name: 'ContractRetainers 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractRetainers.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractRetainers/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractRetainersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractRetainers.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractRetainers/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractretainers by id', async () => {
      const mockData = { id: 1, name: 'Test ContractRetainers' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractRetainers.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractRetainers/1');
    });
  });

  describe('create', () => {
    it('should create contractretainers successfully', async () => {
      const contractRetainersData = { name: 'New ContractRetainers' };
      const mockResponse = { id: 1, ...contractRetainersData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractRetainers.create(contractRetainersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractRetainers', contractRetainersData);
    });
  });

  describe('update', () => {
    it('should update contractretainers successfully', async () => {
      const contractRetainersData = { name: 'Updated ContractRetainers' };
      const mockResponse = { id: 1, ...contractRetainersData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractRetainers.update(1, contractRetainersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractRetainers/1', contractRetainersData);
    });
  });

  describe('patch', () => {
    it('should partially update contractretainers successfully', async () => {
      const contractRetainersData = { name: 'Patched ContractRetainers' };
      const mockResponse = { id: 1, ...contractRetainersData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractRetainers.patch(1, contractRetainersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractRetainers/1', contractRetainersData);
    });
  });

  describe('delete', () => {
    it('should delete contractretainers successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contractRetainers.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractRetainers/1');
    });
  });
});