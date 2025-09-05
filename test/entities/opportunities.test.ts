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
  Opportunities,
  IOpportunities,
  IOpportunitiesQuery,
} from '../../src/entities/opportunities';

describe('Opportunities Entity', () => {
  let setup: EntityTestSetup<Opportunities>;

  beforeEach(() => {
    setup = createEntityTestSetup(Opportunities);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list opportunities successfully', async () => {
      const mockData = [
        { id: 1, name: 'Opportunities 1' },
        { id: 2, name: 'Opportunities 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Opportunities/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: IOpportunitiesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Opportunities/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get opportunities by id', async () => {
      const mockData = { id: 1, name: 'Test Opportunities' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Opportunities/1');
    });
  });

  describe('create', () => {
    it('should create opportunities successfully', async () => {
      const opportunitiesData = { name: 'New Opportunities' };
      const mockResponse = { id: 1, ...opportunitiesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(opportunitiesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Opportunities', opportunitiesData);
    });
  });

  describe('update', () => {
    it('should update opportunities successfully', async () => {
      const opportunitiesData = { name: 'Updated Opportunities' };
      const mockResponse = { id: 1, ...opportunitiesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, opportunitiesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Opportunities/1', opportunitiesData);
    });
  });

  describe('patch', () => {
    it('should partially update opportunities successfully', async () => {
      const opportunitiesData = { name: 'Patched Opportunities' };
      const mockResponse = { id: 1, ...opportunitiesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, opportunitiesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/Opportunities/1', opportunitiesData);
    });
  });
});