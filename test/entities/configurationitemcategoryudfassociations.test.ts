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
  ConfigurationItemCategoryUdfAssociations,
  IConfigurationItemCategoryUdfAssociations,
  IConfigurationItemCategoryUdfAssociationsQuery,
} from '../../src/entities/configurationitemcategoryudfassociations';

describe('ConfigurationItemCategoryUdfAssociations Entity', () => {
  let configurationItemCategoryUdfAssociations: ConfigurationItemCategoryUdfAssociations;
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

    configurationItemCategoryUdfAssociations =
      new ConfigurationItemCategoryUdfAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitemcategoryudfassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemCategoryUdfAssociations 1' },
        { id: 2, name: 'ConfigurationItemCategoryUdfAssociations 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await configurationItemCategoryUdfAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ConfigurationItemCategoryUdfAssociations/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemCategoryUdfAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await configurationItemCategoryUdfAssociations.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ConfigurationItemCategoryUdfAssociations/query',
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
    it('should get configurationitemcategoryudfassociations by id', async () => {
      const mockData = {
        id: 1,
        name: 'Test ConfigurationItemCategoryUdfAssociations',
      };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await configurationItemCategoryUdfAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ConfigurationItemCategoryUdfAssociations/1'
      );
    });
  });
});
