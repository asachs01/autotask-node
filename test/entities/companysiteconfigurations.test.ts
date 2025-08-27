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
  CompanySiteConfigurations,
  ICompanySiteConfigurations,
  ICompanySiteConfigurationsQuery,
} from '../../src/entities/companysiteconfigurations';

describe('CompanySiteConfigurations Entity', () => {
  let companySiteConfigurations: CompanySiteConfigurations;
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

    companySiteConfigurations = new CompanySiteConfigurations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list companysiteconfigurations successfully', async () => {
      const mockData = [
        { id: 1, name: 'CompanySiteConfigurations 1' },
        { id: 2, name: 'CompanySiteConfigurations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companySiteConfigurations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanySiteConfigurations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ICompanySiteConfigurationsQuery = {
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

      await companySiteConfigurations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/CompanySiteConfigurations/query', {
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
    it('should get companysiteconfigurations by id', async () => {
      const mockData = { id: 1, name: 'Test CompanySiteConfigurations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companySiteConfigurations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanySiteConfigurations/1');
    });
  });

  describe('create', () => {
    it('should create companysiteconfigurations successfully', async () => {
      const companySiteConfigurationsData = { name: 'New CompanySiteConfigurations' };
      const mockResponse = { id: 1, ...companySiteConfigurationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await companySiteConfigurations.create(companySiteConfigurationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/CompanySiteConfigurations', companySiteConfigurationsData);
    });
  });

  describe('update', () => {
    it('should update companysiteconfigurations successfully', async () => {
      const companySiteConfigurationsData = { name: 'Updated CompanySiteConfigurations' };
      const mockResponse = { id: 1, ...companySiteConfigurationsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companySiteConfigurations.update(1, companySiteConfigurationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/CompanySiteConfigurations/1', companySiteConfigurationsData);
    });
  });

  describe('patch', () => {
    it('should partially update companysiteconfigurations successfully', async () => {
      const companySiteConfigurationsData = { name: 'Patched CompanySiteConfigurations' };
      const mockResponse = { id: 1, ...companySiteConfigurationsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companySiteConfigurations.patch(1, companySiteConfigurationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/CompanySiteConfigurations/1', companySiteConfigurationsData);
    });
  });

  describe('delete', () => {
    it('should delete companysiteconfigurations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await companySiteConfigurations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/CompanySiteConfigurations/1');
    });
  });
});