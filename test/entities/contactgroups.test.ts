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
  ContactGroups,
  IContactGroups,
  IContactGroupsQuery,
} from '../../src/entities/contactgroups';

describe('ContactGroups Entity', () => {
  let contactGroups: ContactGroups;
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

    contactGroups = new ContactGroups(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contactgroups successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContactGroups 1' },
        { id: 2, name: 'ContactGroups 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contactGroups.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContactGroups/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContactGroupsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contactGroups.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContactGroups/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contactgroups by id', async () => {
      const mockData = { id: 1, name: 'Test ContactGroups' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contactGroups.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContactGroups/1');
    });
  });

  describe('create', () => {
    it('should create contactgroups successfully', async () => {
      const contactGroupsData = { name: 'New ContactGroups' };
      const mockResponse = { id: 1, ...contactGroupsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contactGroups.create(contactGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContactGroups', contactGroupsData);
    });
  });

  describe('update', () => {
    it('should update contactgroups successfully', async () => {
      const contactGroupsData = { name: 'Updated ContactGroups' };
      const mockResponse = { id: 1, ...contactGroupsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contactGroups.update(1, contactGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContactGroups/1', contactGroupsData);
    });
  });

  describe('patch', () => {
    it('should partially update contactgroups successfully', async () => {
      const contactGroupsData = { name: 'Patched ContactGroups' };
      const mockResponse = { id: 1, ...contactGroupsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contactGroups.patch(1, contactGroupsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContactGroups/1', contactGroupsData);
    });
  });

  describe('delete', () => {
    it('should delete contactgroups successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contactGroups.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContactGroups/1');
    });
  });
});