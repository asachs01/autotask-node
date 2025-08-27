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
  ProjectCharges,
  IProjectCharges,
  IProjectChargesQuery,
} from '../../src/entities/projectcharges';

describe('ProjectCharges Entity', () => {
  let projectCharges: ProjectCharges;
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

    projectCharges = new ProjectCharges(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list projectcharges successfully', async () => {
      const mockData = [
        { id: 1, name: 'ProjectCharges 1' },
        { id: 2, name: 'ProjectCharges 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await projectCharges.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ProjectCharges/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IProjectChargesQuery = {
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

      await projectCharges.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ProjectCharges/query', {
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
    it('should get projectcharges by id', async () => {
      const mockData = { id: 1, name: 'Test ProjectCharges' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await projectCharges.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ProjectCharges/1');
    });
  });

  describe('create', () => {
    it('should create projectcharges successfully', async () => {
      const projectChargesData = { name: 'New ProjectCharges' };
      const mockResponse = { id: 1, ...projectChargesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await projectCharges.create(projectChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ProjectCharges', projectChargesData);
    });
  });

  describe('update', () => {
    it('should update projectcharges successfully', async () => {
      const projectChargesData = { name: 'Updated ProjectCharges' };
      const mockResponse = { id: 1, ...projectChargesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await projectCharges.update(1, projectChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ProjectCharges/1', projectChargesData);
    });
  });

  describe('patch', () => {
    it('should partially update projectcharges successfully', async () => {
      const projectChargesData = { name: 'Patched ProjectCharges' };
      const mockResponse = { id: 1, ...projectChargesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await projectCharges.patch(1, projectChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ProjectCharges/1', projectChargesData);
    });
  });

  describe('delete', () => {
    it('should delete projectcharges successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await projectCharges.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ProjectCharges/1');
    });
  });
});