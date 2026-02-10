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
  ResourceRoleDepartments,
  IResourceRoleDepartments,
  IResourceRoleDepartmentsQuery,
} from '../../src/entities/resourceroledepartments';

describe('ResourceRoleDepartments Entity', () => {
  let resourceRoleDepartments: ResourceRoleDepartments;
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

    resourceRoleDepartments = new ResourceRoleDepartments(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resourceroledepartments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ResourceRoleDepartments 1' },
        { id: 2, name: 'ResourceRoleDepartments 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await resourceRoleDepartments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ResourceRoleDepartments/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IResourceRoleDepartmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await resourceRoleDepartments.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ResourceRoleDepartments/query',
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
    it('should get resourceroledepartments by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceRoleDepartments' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await resourceRoleDepartments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceRoleDepartments/1');
    });
  });

  describe('create', () => {
    it('should create resourceroledepartments successfully', async () => {
      const resourceRoleDepartmentsData = {
        name: 'New ResourceRoleDepartments',
      };
      const mockResponse = { id: 1, ...resourceRoleDepartmentsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await resourceRoleDepartments.create(
        resourceRoleDepartmentsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ResourceRoleDepartments',
        resourceRoleDepartmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete resourceroledepartments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await resourceRoleDepartments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ResourceRoleDepartments/1'
      );
    });
  });
});
