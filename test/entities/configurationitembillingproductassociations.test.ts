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
  ConfigurationItemBillingProductAssociations,
  IConfigurationItemBillingProductAssociations,
  IConfigurationItemBillingProductAssociationsQuery,
} from '../../src/entities/configurationitembillingproductassociations';

describe('ConfigurationItemBillingProductAssociations Entity', () => {
  let configurationItemBillingProductAssociations: ConfigurationItemBillingProductAssociations;
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

    configurationItemBillingProductAssociations =
      new ConfigurationItemBillingProductAssociations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list configurationitembillingproductassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ConfigurationItemBillingProductAssociations 1' },
        { id: 2, name: 'ConfigurationItemBillingProductAssociations 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await configurationItemBillingProductAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ConfigurationItemBillingProductAssociations/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IConfigurationItemBillingProductAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await configurationItemBillingProductAssociations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ConfigurationItemBillingProductAssociations/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get configurationitembillingproductassociations by id', async () => {
      const mockData = {
        id: 1,
        name: 'Test ConfigurationItemBillingProductAssociations',
      };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await configurationItemBillingProductAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ConfigurationItemBillingProductAssociations/1'
      );
    });
  });

  describe('create', () => {
    it('should create configurationitembillingproductassociations successfully', async () => {
      const configurationItemBillingProductAssociationsData = {
        name: 'New ConfigurationItemBillingProductAssociations',
      };
      const mockResponse = {
        id: 1,
        ...configurationItemBillingProductAssociationsData,
      };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await configurationItemBillingProductAssociations.create(
        configurationItemBillingProductAssociationsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ConfigurationItemBillingProductAssociations',
        configurationItemBillingProductAssociationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete configurationitembillingproductassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await configurationItemBillingProductAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ConfigurationItemBillingProductAssociations/1'
      );
    });
  });
});
