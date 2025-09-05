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
  ContractRates,
  IContractRates,
  IContractRatesQuery,
} from '../../src/entities/contractrates';

describe('ContractRates Entity', () => {
  let contractRates: ContractRates;
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

    contractRates = new ContractRates(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractrates successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractRates 1' },
        { id: 2, name: 'ContractRates 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractRates.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractRates/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractRatesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractRates.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractRates/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractrates by id', async () => {
      const mockData = { id: 1, name: 'Test ContractRates' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractRates.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractRates/1');
    });
  });

  describe('create', () => {
    it('should create contractrates successfully', async () => {
      const contractRatesData = { name: 'New ContractRates' };
      const mockResponse = { id: 1, ...contractRatesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractRates.create(contractRatesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractRates', contractRatesData);
    });
  });

  describe('update', () => {
    it('should update contractrates successfully', async () => {
      const contractRatesData = { name: 'Updated ContractRates' };
      const mockResponse = { id: 1, ...contractRatesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractRates.update(1, contractRatesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractRates/1', contractRatesData);
    });
  });

  describe('patch', () => {
    it('should partially update contractrates successfully', async () => {
      const contractRatesData = { name: 'Patched ContractRates' };
      const mockResponse = { id: 1, ...contractRatesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractRates.patch(1, contractRatesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractRates/1', contractRatesData);
    });
  });

  describe('delete', () => {
    it('should delete contractrates successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contractRates.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractRates/1');
    });
  });
});