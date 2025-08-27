import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import winston from 'winston';
import {
  ResourceSkills,
  IResourceSkills,
  IResourceSkillsQuery,
} from '../../src/entities/resourceskills';

describe('ResourceSkills Entity', () => {
  let resourceSkills: ResourceSkills;
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

    resourceSkills = new ResourceSkills(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list resourceskills successfully', async () => {
      const mockData = [
        { id: 1, name: 'ResourceSkills 1' },
        { id: 2, name: 'ResourceSkills 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceSkills.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceSkills/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IResourceSkillsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.get.mockResolvedValueOnce({
        data: { items: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await resourceSkills.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceSkills/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        }
      });
    });
  });

  describe('get', () => {
    it('should get resourceskills by id', async () => {
      const mockData = { id: 1, name: 'Test ResourceSkills' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceSkills.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ResourceSkills/1');
    });
  });

  describe('create', () => {
    it('should create resourceskills successfully', async () => {
      const resourceSkillsData = { name: 'New ResourceSkills' };
      const mockResponse = { id: 1, ...resourceSkillsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await resourceSkills.create(resourceSkillsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ResourceSkills', resourceSkillsData);
    });
  });

  describe('update', () => {
    it('should update resourceskills successfully', async () => {
      const resourceSkillsData = { name: 'Updated ResourceSkills' };
      const mockResponse = { id: 1, ...resourceSkillsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceSkills.update(1, resourceSkillsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ResourceSkills/1', resourceSkillsData);
    });
  });

  describe('patch', () => {
    it('should partially update resourceskills successfully', async () => {
      const resourceSkillsData = { name: 'Patched ResourceSkills' };
      const mockResponse = { id: 1, ...resourceSkillsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await resourceSkills.patch(1, resourceSkillsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ResourceSkills/1', resourceSkillsData);
    });
  });

  describe('delete', () => {
    it('should delete resourceskills successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await resourceSkills.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ResourceSkills/1');
    });
  });
});