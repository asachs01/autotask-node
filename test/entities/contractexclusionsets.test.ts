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
  ContractExclusionSets,
  IContractExclusionSets,
  IContractExclusionSetsQuery,
} from '../../src/entities/contractexclusionsets';

describe('ContractExclusionSets Entity', () => {
  let contractExclusionSets: ContractExclusionSets;
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

    contractExclusionSets = new ContractExclusionSets(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionsets successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionSets 1' },
        { id: 2, name: 'ContractExclusionSets 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractExclusionSets.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSets/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionSetsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractExclusionSets.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSets/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractexclusionsets by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionSets' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractExclusionSets.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSets/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = { name: 'New ContractExclusionSets' };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractExclusionSets.create(contractExclusionSetsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractExclusionSets', contractExclusionSetsData);
    });
  });

  describe('update', () => {
    it('should update contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = { name: 'Updated ContractExclusionSets' };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractExclusionSets.update(1, contractExclusionSetsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractExclusionSets/1', contractExclusionSetsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = { name: 'Patched ContractExclusionSets' };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractExclusionSets.patch(1, contractExclusionSetsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractExclusionSets/1', contractExclusionSetsData);
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionsets successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contractExclusionSets.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionSets/1');
    });
  });
});