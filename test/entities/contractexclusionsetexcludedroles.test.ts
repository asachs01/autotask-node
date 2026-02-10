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
  ContractExclusionSetExcludedRoles,
  IContractExclusionSetExcludedRoles,
  IContractExclusionSetExcludedRolesQuery,
} from '../../src/entities/contractexclusionsetexcludedroles';

describe('ContractExclusionSetExcludedRoles Entity', () => {
  let contractExclusionSetExcludedRoles: ContractExclusionSetExcludedRoles;
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

    contractExclusionSetExcludedRoles = new ContractExclusionSetExcludedRoles(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionsetexcludedroles successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionSetExcludedRoles 1' },
        { id: 2, name: 'ContractExclusionSetExcludedRoles 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contractExclusionSetExcludedRoles.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractExclusionSetExcludedRoles/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionSetExcludedRolesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contractExclusionSetExcludedRoles.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractExclusionSetExcludedRoles/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('get', () => {
    it('should get contractexclusionsetexcludedroles by id', async () => {
      const mockData = {
        id: 1,
        name: 'Test ContractExclusionSetExcludedRoles',
      };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contractExclusionSetExcludedRoles.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractExclusionSetExcludedRoles/1'
      );
    });
  });

  describe('create', () => {
    it('should create contractexclusionsetexcludedroles successfully', async () => {
      const contractExclusionSetExcludedRolesData = {
        name: 'New ContractExclusionSetExcludedRoles',
      };
      const mockResponse = { id: 1, ...contractExclusionSetExcludedRolesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractExclusionSetExcludedRoles.create(
        contractExclusionSetExcludedRolesData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractExclusionSetExcludedRoles',
        contractExclusionSetExcludedRolesData
      );
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionsetexcludedroles successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contractExclusionSetExcludedRoles.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ContractExclusionSetExcludedRoles/1'
      );
    });
  });
});
