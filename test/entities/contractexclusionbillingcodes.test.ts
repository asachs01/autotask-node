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
  ContractExclusionBillingCodes,
  IContractExclusionBillingCodes,
  IContractExclusionBillingCodesQuery,
} from '../../src/entities/contractexclusionbillingcodes';

describe('ContractExclusionBillingCodes Entity', () => {
  let contractExclusionBillingCodes: ContractExclusionBillingCodes;
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

    contractExclusionBillingCodes = new ContractExclusionBillingCodes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionbillingcodes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionBillingCodes 1' },
        { id: 2, name: 'ContractExclusionBillingCodes 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractExclusionBillingCodes.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionBillingCodes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionBillingCodesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractExclusionBillingCodes.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionBillingCodes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractexclusionbillingcodes by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionBillingCodes' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractExclusionBillingCodes.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionBillingCodes/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionbillingcodes successfully', async () => {
      const contractExclusionBillingCodesData = { name: 'New ContractExclusionBillingCodes' };
      const mockResponse = { id: 1, ...contractExclusionBillingCodesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractExclusionBillingCodes.create(contractExclusionBillingCodesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractExclusionBillingCodes', contractExclusionBillingCodesData);
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionbillingcodes successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contractExclusionBillingCodes.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionBillingCodes/1');
    });
  });
});