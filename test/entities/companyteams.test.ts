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
  CompanyTeams,
  ICompanyTeams,
  ICompanyTeamsQuery,
} from '../../src/entities/companyteams';

describe('CompanyTeams Entity', () => {
  let companyTeams: CompanyTeams;
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

    companyTeams = new CompanyTeams(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list companyteams successfully', async () => {
      const mockData = [
        { id: 1, name: 'CompanyTeams 1' },
        { id: 2, name: 'CompanyTeams 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await companyTeams.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyTeams/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ICompanyTeamsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await companyTeams.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyTeams/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get companyteams by id', async () => {
      const mockData = { id: 1, name: 'Test CompanyTeams' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await companyTeams.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/CompanyTeams/1');
    });
  });

  describe('create', () => {
    it('should create companyteams successfully', async () => {
      const companyTeamsData = { name: 'New CompanyTeams' };
      const mockResponse = { id: 1, ...companyTeamsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await companyTeams.create(companyTeamsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/CompanyTeams',
        companyTeamsData
      );
    });
  });

  describe('update', () => {
    it('should update companyteams successfully', async () => {
      const companyTeamsData = { name: 'Updated CompanyTeams' };
      const mockResponse = { id: 1, ...companyTeamsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await companyTeams.update(1, companyTeamsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/CompanyTeams/1',
        companyTeamsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update companyteams successfully', async () => {
      const companyTeamsData = { name: 'Patched CompanyTeams' };
      const mockResponse = { id: 1, ...companyTeamsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await companyTeams.patch(1, companyTeamsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/CompanyTeams/1',
        companyTeamsData
      );
    });
  });

  describe('delete', () => {
    it('should delete companyteams successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await companyTeams.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/CompanyTeams/1');
    });
  });
});
