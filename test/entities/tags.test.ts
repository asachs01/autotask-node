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
  Tags,
  ITags,
  ITagsQuery,
} from '../../src/entities/tags';

describe('Tags Entity', () => {
  let setup: EntityTestSetup<Tags>;

  beforeEach(() => {
    setup = createEntityTestSetup(Tags);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list tags successfully', async () => {
      const mockData = [
        { id: 1, name: 'Tags 1' },
        { id: 2, name: 'Tags 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tags/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: ITagsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tags/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get tags by id', async () => {
      const mockData = { id: 1, name: 'Test Tags' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tags/1');
    });
  });

  describe('create', () => {
    it('should create tags successfully', async () => {
      const tagsData = { name: 'New Tags' };
      const mockResponse = { id: 1, ...tagsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(tagsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tags', tagsData);
    });
  });

  describe('update', () => {
    it('should update tags successfully', async () => {
      const tagsData = { name: 'Updated Tags' };
      const mockResponse = { id: 1, ...tagsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, tagsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Tags/1', tagsData);
    });
  });

  describe('patch', () => {
    it('should partially update tags successfully', async () => {
      const tagsData = { name: 'Patched Tags' };
      const mockResponse = { id: 1, ...tagsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, tagsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/Tags/1', tagsData);
    });
  });

  describe('delete', () => {
    it('should delete tags successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/Tags/1');
    });
  });
});