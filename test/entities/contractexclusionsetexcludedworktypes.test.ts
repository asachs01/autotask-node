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
  ContractExclusionSetExcludedWorkTypes,
  IContractExclusionSetExcludedWorkTypes,
  IContractExclusionSetExcludedWorkTypesQuery,
} from '../../src/entities/contractexclusionsetexcludedworktypes';

describe('ContractExclusionSetExcludedWorkTypes Entity', () => {
  let contractExclusionSetExcludedWorkTypes: ContractExclusionSetExcludedWorkTypes;
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

    contractExclusionSetExcludedWorkTypes = new ContractExclusionSetExcludedWorkTypes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionsetexcludedworktypes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionSetExcludedWorkTypes 1' },
        { id: 2, name: 'ContractExclusionSetExcludedWorkTypes 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractExclusionSetExcludedWorkTypes.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionSetExcludedWorkTypesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractExclusionSetExcludedWorkTypes.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractexclusionsetexcludedworktypes by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionSetExcludedWorkTypes' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractExclusionSetExcludedWorkTypes.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionsetexcludedworktypes successfully', async () => {
      const contractExclusionSetExcludedWorkTypesData = { name: 'New ContractExclusionSetExcludedWorkTypes' };
      const mockResponse = { id: 1, ...contractExclusionSetExcludedWorkTypesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractExclusionSetExcludedWorkTypes.create(contractExclusionSetExcludedWorkTypesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes', contractExclusionSetExcludedWorkTypesData);
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionsetexcludedworktypes successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contractExclusionSetExcludedWorkTypes.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionSetExcludedWorkTypes/1');
    });
  });
});