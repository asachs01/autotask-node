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
  ChecklistLibraries,
  IChecklistLibraries,
  IChecklistLibrariesQuery,
} from '../../src/entities/checklistlibraries';

describe('ChecklistLibraries Entity', () => {
  let checklistLibraries: ChecklistLibraries;
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

    checklistLibraries = new ChecklistLibraries(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list checklistlibraries successfully', async () => {
      const mockData = [
        { id: 1, name: 'ChecklistLibraries 1' },
        { id: 2, name: 'ChecklistLibraries 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await checklistLibraries.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ChecklistLibraries/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IChecklistLibrariesQuery = {
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

      await checklistLibraries.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ChecklistLibraries/query', {
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
    it('should get checklistlibraries by id', async () => {
      const mockData = { id: 1, name: 'Test ChecklistLibraries' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await checklistLibraries.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ChecklistLibraries/1');
    });
  });

  describe('create', () => {
    it('should create checklistlibraries successfully', async () => {
      const checklistLibrariesData = { name: 'New ChecklistLibraries' };
      const mockResponse = { id: 1, ...checklistLibrariesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await checklistLibraries.create(checklistLibrariesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ChecklistLibraries', checklistLibrariesData);
    });
  });

  describe('update', () => {
    it('should update checklistlibraries successfully', async () => {
      const checklistLibrariesData = { name: 'Updated ChecklistLibraries' };
      const mockResponse = { id: 1, ...checklistLibrariesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await checklistLibraries.update(1, checklistLibrariesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ChecklistLibraries/1', checklistLibrariesData);
    });
  });

  describe('patch', () => {
    it('should partially update checklistlibraries successfully', async () => {
      const checklistLibrariesData = { name: 'Patched ChecklistLibraries' };
      const mockResponse = { id: 1, ...checklistLibrariesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await checklistLibraries.patch(1, checklistLibrariesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ChecklistLibraries/1', checklistLibrariesData);
    });
  });

  describe('delete', () => {
    it('should delete checklistlibraries successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await checklistLibraries.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ChecklistLibraries/1');
    });
  });
});