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
  ContractRoleCosts,
  IContractRoleCosts,
  IContractRoleCostsQuery,
} from '../../src/entities/contractrolecosts';

describe('ContractRoleCosts Entity', () => {
  let contractRoleCosts: ContractRoleCosts;
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

    contractRoleCosts = new ContractRoleCosts(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractrolecosts successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractRoleCosts 1' },
        { id: 2, name: 'ContractRoleCosts 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contractRoleCosts.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRoleCosts/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractRoleCostsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contractRoleCosts.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRoleCosts/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get contractrolecosts by id', async () => {
      const mockData = { id: 1, name: 'Test ContractRoleCosts' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contractRoleCosts.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractRoleCosts/1');
    });
  });

  describe('create', () => {
    it('should create contractrolecosts successfully', async () => {
      const contractRoleCostsData = { name: 'New ContractRoleCosts' };
      const mockResponse = { id: 1, ...contractRoleCostsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractRoleCosts.create(contractRoleCostsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractRoleCosts',
        contractRoleCostsData
      );
    });
  });

  describe('update', () => {
    it('should update contractrolecosts successfully', async () => {
      const contractRoleCostsData = { name: 'Updated ContractRoleCosts' };
      const mockResponse = { id: 1, ...contractRoleCostsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await contractRoleCosts.update(1, contractRoleCostsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ContractRoleCosts/1',
        contractRoleCostsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update contractrolecosts successfully', async () => {
      const contractRoleCostsData = { name: 'Patched ContractRoleCosts' };
      const mockResponse = { id: 1, ...contractRoleCostsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractRoleCosts.patch(1, contractRoleCostsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ContractRoleCosts/1',
        contractRoleCostsData
      );
    });
  });

  describe('delete', () => {
    it('should delete contractrolecosts successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contractRoleCosts.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractRoleCosts/1');
    });
  });
});
