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
  CompanyToDos,
  ICompanyToDos,
  ICompanyToDosQuery,
} from '../../src/entities/companytodos';

describe('CompanyToDos Entity', () => {
  let companyToDos: CompanyToDos;
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

    companyToDos = new CompanyToDos(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list companytodos successfully', async () => {
      const mockData = [
        { id: 1, name: 'CompanyToDos 1' },
        { id: 2, name: 'CompanyToDos 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companyToDos.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyToDos/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: ICompanyToDosQuery = {
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

      await companyToDos.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyToDos/query', {
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
    it('should get companytodos by id', async () => {
      const mockData = { id: 1, name: 'Test CompanyToDos' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companyToDos.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyToDos/1');
    });
  });

  describe('create', () => {
    it('should create companytodos successfully', async () => {
      const companyToDosData = { name: 'New CompanyToDos' };
      const mockResponse = { id: 1, ...companyToDosData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await companyToDos.create(companyToDosData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/CompanyToDos', companyToDosData);
    });
  });

  describe('update', () => {
    it('should update companytodos successfully', async () => {
      const companyToDosData = { name: 'Updated CompanyToDos' };
      const mockResponse = { id: 1, ...companyToDosData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companyToDos.update(1, companyToDosData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/CompanyToDos/1', companyToDosData);
    });
  });

  describe('patch', () => {
    it('should partially update companytodos successfully', async () => {
      const companyToDosData = { name: 'Patched CompanyToDos' };
      const mockResponse = { id: 1, ...companyToDosData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await companyToDos.patch(1, companyToDosData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/CompanyToDos/1', companyToDosData);
    });
  });

  describe('delete', () => {
    it('should delete companytodos successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await companyToDos.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/CompanyToDos/1');
    });
  });
});