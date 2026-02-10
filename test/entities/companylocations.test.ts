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
  CompanyLocations,
  ICompanyLocations,
  ICompanyLocationsQuery,
} from '../../src/entities/companylocations';

describe('CompanyLocations Entity', () => {
  let companyLocations: CompanyLocations;
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

    companyLocations = new CompanyLocations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list companylocations successfully', async () => {
      const mockData = [
        { id: 1, name: 'CompanyLocations 1' },
        { id: 2, name: 'CompanyLocations 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await companyLocations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/CompanyLocations/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ICompanyLocationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await companyLocations.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/CompanyLocations/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get companylocations by id', async () => {
      const mockData = { id: 1, name: 'Test CompanyLocations' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await companyLocations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyLocations/1');
    });
  });

  describe('create', () => {
    it('should create companylocations successfully', async () => {
      const companyLocationsData = { name: 'New CompanyLocations' };
      const mockResponse = { id: 1, ...companyLocationsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await companyLocations.create(companyLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/CompanyLocations',
        companyLocationsData
      );
    });
  });

  describe('update', () => {
    it('should update companylocations successfully', async () => {
      const companyLocationsData = { name: 'Updated CompanyLocations' };
      const mockResponse = { id: 1, ...companyLocationsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await companyLocations.update(1, companyLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/CompanyLocations/1',
        companyLocationsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update companylocations successfully', async () => {
      const companyLocationsData = { name: 'Patched CompanyLocations' };
      const mockResponse = { id: 1, ...companyLocationsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await companyLocations.patch(1, companyLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/CompanyLocations/1',
        companyLocationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete companylocations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await companyLocations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/CompanyLocations/1');
    });
  });
});
