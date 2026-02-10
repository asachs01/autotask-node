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
  Companies,
  ICompanies,
  ICompaniesQuery,
} from '../../src/entities/companies';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';

describe('Companies Entity', () => {
  let setup: EntityTestSetup<Companies>;

  beforeEach(() => {
    setup = createEntityTestSetup(Companies);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list companies successfully', async () => {
      const mockData = [
        { id: 1, name: 'Companies 1' },
        { id: 2, name: 'Companies 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Companies/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ICompaniesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Companies/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get companies by id', async () => {
      const mockData = { id: 1, name: 'Test Companies' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Companies/1');
    });
  });

  describe('create', () => {
    it('should create companies successfully', async () => {
      const companiesData = { name: 'New Companies' };
      const mockResponse = { id: 1, ...companiesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(companiesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Companies',
        companiesData
      );
    });
  });

  describe('update', () => {
    it('should update companies successfully', async () => {
      const companiesData = { name: 'Updated Companies' };
      const mockResponse = { id: 1, ...companiesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, companiesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/Companies/1',
        companiesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update companies successfully', async () => {
      const companiesData = { name: 'Patched Companies' };
      const mockResponse = { id: 1, ...companiesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, companiesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Companies/1',
        companiesData
      );
    });
  });
});
