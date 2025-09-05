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
  ClientPortalUsers,
  IClientPortalUsers,
  IClientPortalUsersQuery,
} from '../../src/entities/clientportalusers';

describe('ClientPortalUsers Entity', () => {
  let clientPortalUsers: ClientPortalUsers;
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

    clientPortalUsers = new ClientPortalUsers(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list clientportalusers successfully', async () => {
      const mockData = [
        { id: 1, name: 'ClientPortalUsers 1' },
        { id: 2, name: 'ClientPortalUsers 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await clientPortalUsers.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ClientPortalUsers/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IClientPortalUsersQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await clientPortalUsers.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ClientPortalUsers/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get clientportalusers by id', async () => {
      const mockData = { id: 1, name: 'Test ClientPortalUsers' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await clientPortalUsers.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ClientPortalUsers/1');
    });
  });

  describe('create', () => {
    it('should create clientportalusers successfully', async () => {
      const clientPortalUsersData = { name: 'New ClientPortalUsers' };
      const mockResponse = { id: 1, ...clientPortalUsersData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await clientPortalUsers.create(clientPortalUsersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ClientPortalUsers', clientPortalUsersData);
    });
  });

  describe('update', () => {
    it('should update clientportalusers successfully', async () => {
      const clientPortalUsersData = { name: 'Updated ClientPortalUsers' };
      const mockResponse = { id: 1, ...clientPortalUsersData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await clientPortalUsers.update(1, clientPortalUsersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ClientPortalUsers/1', clientPortalUsersData);
    });
  });

  describe('patch', () => {
    it('should partially update clientportalusers successfully', async () => {
      const clientPortalUsersData = { name: 'Patched ClientPortalUsers' };
      const mockResponse = { id: 1, ...clientPortalUsersData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await clientPortalUsers.patch(1, clientPortalUsersData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ClientPortalUsers/1', clientPortalUsersData);
    });
  });

  describe('delete', () => {
    it('should delete clientportalusers successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await clientPortalUsers.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ClientPortalUsers/1');
    });
  });
});