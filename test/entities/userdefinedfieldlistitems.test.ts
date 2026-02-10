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
  UserDefinedFieldListItems,
  IUserDefinedFieldListItems,
  IUserDefinedFieldListItemsQuery,
} from '../../src/entities/userdefinedfieldlistitems';

describe('UserDefinedFieldListItems Entity', () => {
  let setup: EntityTestSetup<UserDefinedFieldListItems>;

  beforeEach(() => {
    setup = createEntityTestSetup(UserDefinedFieldListItems);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list userdefinedfieldlistitems successfully', async () => {
      const mockData = [
        { id: 1, name: 'UserDefinedFieldListItems 1' },
        { id: 2, name: 'UserDefinedFieldListItems 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/UserDefinedFieldListItems/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IUserDefinedFieldListItemsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/UserDefinedFieldListItems/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('get', () => {
    it('should get userdefinedfieldlistitems by id', async () => {
      const mockData = { id: 1, name: 'Test UserDefinedFieldListItems' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith(
        '/UserDefinedFieldListItems/1'
      );
    });
  });
});
