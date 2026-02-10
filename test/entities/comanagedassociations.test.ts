import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import winston from 'winston';
import {
  ComanagedAssociations,
  IComanagedAssociations,
  IComanagedAssociationsQuery,
} from '../../src/entities/comanagedassociations';

describe('ComanagedAssociations Entity', () => {
  let setup: EntityTestSetup<ComanagedAssociations>;

  beforeEach(() => {
    setup = createEntityTestSetup(ComanagedAssociations);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list comanagedassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ComanagedAssociations 1' },
        { id: 2, name: 'ComanagedAssociations 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/ComanagedAssociations/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IComanagedAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/ComanagedAssociations/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          maxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get comanagedassociations by id', async () => {
      const mockData = { id: 1, name: 'Test ComanagedAssociations' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith(
        '/ComanagedAssociations/1'
      );
    });
  });

  describe('create', () => {
    it('should create comanagedassociations successfully', async () => {
      const comanagedAssociationsData = { name: 'New ComanagedAssociations' };
      const mockResponse = { id: 1, ...comanagedAssociationsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(comanagedAssociationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/ComanagedAssociations',
        comanagedAssociationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete comanagedassociations successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith(
        '/ComanagedAssociations/1'
      );
    });
  });
});
