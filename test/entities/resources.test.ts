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
  Resources,
  IResources,
  IResourcesQuery,
} from '../../src/entities/resources';

describe('Resources Entity', () => {
  let setup: EntityTestSetup<Resources>;

  beforeEach(() => {
    setup = createEntityTestSetup(Resources);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list resources successfully', async () => {
      const mockData = [
        { id: 1, name: 'Resources 1' },
        { id: 2, name: 'Resources 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Resources/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IResourcesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Resources/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get resources by id', async () => {
      const mockData = { id: 1, name: 'Test Resources' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Resources/1');
    });
  });

  describe('create', () => {
    it('should create resources successfully', async () => {
      const resourcesData = { name: 'New Resources' };
      const mockResponse = { id: 1, ...resourcesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(resourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Resources',
        resourcesData
      );
    });
  });

  describe('update', () => {
    it('should update resources successfully', async () => {
      const resourcesData = { name: 'Updated Resources' };
      const mockResponse = { id: 1, ...resourcesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, resourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/Resources/1',
        resourcesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update resources successfully', async () => {
      const resourcesData = { name: 'Patched Resources' };
      const mockResponse = { id: 1, ...resourcesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, resourcesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Resources/1',
        resourcesData
      );
    });
  });
});
