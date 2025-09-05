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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await companyToDos.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/CompanyToDos/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ICompanyToDosQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await companyToDos.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/CompanyToDos/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get companytodos by id', async () => {
      const mockData = { id: 1, name: 'Test CompanyToDos' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await companyToDos.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/CompanyToDos/1');
    });
  });

  describe('create', () => {
    it('should create companytodos successfully', async () => {
      const companyToDosData = { name: 'New CompanyToDos' };
      const mockResponse = { id: 1, ...companyToDosData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await companyToDos.create(companyToDosData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/CompanyToDos', companyToDosData);
    });
  });

  describe('update', () => {
    it('should update companytodos successfully', async () => {
      const companyToDosData = { name: 'Updated CompanyToDos' };
      const mockResponse = { id: 1, ...companyToDosData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await companyToDos.update(1, companyToDosData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/CompanyToDos/1', companyToDosData);
    });
  });

  describe('patch', () => {
    it('should partially update companytodos successfully', async () => {
      const companyToDosData = { name: 'Patched CompanyToDos' };
      const mockResponse = { id: 1, ...companyToDosData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await companyToDos.patch(1, companyToDosData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/CompanyToDos/1', companyToDosData);
    });
  });

  describe('delete', () => {
    it('should delete companytodos successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await companyToDos.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/CompanyToDos/1');
    });
  });
});