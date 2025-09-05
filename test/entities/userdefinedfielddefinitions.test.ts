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
  UserDefinedFieldDefinitions,
  IUserDefinedFieldDefinitions,
  IUserDefinedFieldDefinitionsQuery,
} from '../../src/entities/userdefinedfielddefinitions';

describe('UserDefinedFieldDefinitions Entity', () => {
  let setup: EntityTestSetup<describe>;

  beforeEach(() => {
    setup = createEntityTestSetup(describe);
  });

    userDefinedFieldDefinitions = new UserDefinedFieldDefinitions(mockAxios, mockLogger);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list userdefinedfielddefinitions successfully', async () => {
      const mockData = [
        { id: 1, name: 'UserDefinedFieldDefinitions 1' },
        { id: 2, name: 'UserDefinedFieldDefinitions 2' },
      ];

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(setup.entity.data).toEqual(mockData);
      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/UserDefinedFieldDefinitions/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IUserDefinedFieldDefinitionsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/UserDefinedFieldDefinitions/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get userdefinedfielddefinitions by id', async () => {
      const mockData = { id: 1, name: 'Test UserDefinedFieldDefinitions' };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(setup.entity.data).toEqual(mockData);
      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/UserDefinedFieldDefinitions/1');
    });
  });
});