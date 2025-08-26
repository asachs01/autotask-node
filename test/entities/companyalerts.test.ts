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
  CompanyAlerts,
  ICompanyAlerts,
  ICompanyAlertsQuery,
} from '../../src/entities/companyalerts';

describe('CompanyAlerts Entity', () => {
  let companyAlerts: CompanyAlerts;
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

    companyAlerts = new CompanyAlerts(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list companyalerts successfully', async () => {
      const mockData = [
        { id: 1, name: 'CompanyAlerts 1' },
        { id: 2, name: 'CompanyAlerts 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companyAlerts.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyAlerts/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ICompanyAlertsQuery = {
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

      await companyAlerts.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyAlerts/query', {
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
    it('should get companyalerts by id', async () => {
      const mockData = { id: 1, name: 'Test CompanyAlerts' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companyAlerts.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyAlerts/1');
    });
  });

  describe('create', () => {
    it('should create companyalerts successfully', async () => {
      const companyAlertsData = { name: 'New CompanyAlerts' };
      const mockResponse = { id: 1, ...companyAlertsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await companyAlerts.create(companyAlertsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/CompanyAlerts', companyAlertsData);
    });
  });

  describe('update', () => {
    it('should update companyalerts successfully', async () => {
      const companyAlertsData = { name: 'Updated CompanyAlerts' };
      const mockResponse = { id: 1, ...companyAlertsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companyAlerts.update(1, companyAlertsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/CompanyAlerts/1', companyAlertsData);
    });
  });

  describe('patch', () => {
    it('should partially update companyalerts successfully', async () => {
      const companyAlertsData = { name: 'Patched CompanyAlerts' };
      const mockResponse = { id: 1, ...companyAlertsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companyAlerts.patch(1, companyAlertsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/CompanyAlerts/1', companyAlertsData);
    });
  });

  describe('delete', () => {
    it('should delete companyalerts successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await companyAlerts.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/CompanyAlerts/1');
    });
  });
});