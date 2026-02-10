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
import { Tasks, ITasks, ITasksQuery } from '../../src/entities/tasks';

describe('Tasks Entity', () => {
  let setup: EntityTestSetup<Tasks>;

  beforeEach(() => {
    setup = createEntityTestSetup(Tasks);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list tasks successfully', async () => {
      const mockData = [
        { id: 1, name: 'Tasks 1' },
        { id: 2, name: 'Tasks 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tasks/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ITasksQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tasks/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get tasks by id', async () => {
      const mockData = { id: 1, name: 'Test Tasks' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Tasks/1');
    });
  });

  describe('create', () => {
    it('should create tasks successfully', async () => {
      const tasksData = { name: 'New Tasks' };
      const mockResponse = { id: 1, ...tasksData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(tasksData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Tasks', tasksData);
    });
  });

  describe('update', () => {
    it('should update tasks successfully', async () => {
      const tasksData = { name: 'Updated Tasks' };
      const mockResponse = { id: 1, ...tasksData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, tasksData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Tasks/1', tasksData);
    });
  });

  describe('patch', () => {
    it('should partially update tasks successfully', async () => {
      const tasksData = { name: 'Patched Tasks' };
      const mockResponse = { id: 1, ...tasksData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, tasksData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/Tasks/1', tasksData);
    });
  });
});
