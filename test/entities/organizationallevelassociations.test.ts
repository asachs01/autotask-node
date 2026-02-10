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
  OrganizationalLevelAssociations,
  IOrganizationalLevelAssociations,
  IOrganizationalLevelAssociationsQuery,
} from '../../src/entities/organizationallevelassociations';

describe('OrganizationalLevelAssociations Entity', () => {
  let organizationalLevelAssociations: OrganizationalLevelAssociations;
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

    organizationalLevelAssociations = new OrganizationalLevelAssociations(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list organizationallevelassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'OrganizationalLevelAssociations 1' },
        { id: 2, name: 'OrganizationalLevelAssociations 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await organizationalLevelAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/OrganizationalLevelAssociations/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IOrganizationalLevelAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await organizationalLevelAssociations.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/OrganizationalLevelAssociations/query',
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
    it('should get organizationallevelassociations by id', async () => {
      const mockData = { id: 1, name: 'Test OrganizationalLevelAssociations' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await organizationalLevelAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/OrganizationalLevelAssociations/1'
      );
    });
  });

  describe('create', () => {
    it('should create organizationallevelassociations successfully', async () => {
      const organizationalLevelAssociationsData = {
        name: 'New OrganizationalLevelAssociations',
      };
      const mockResponse = { id: 1, ...organizationalLevelAssociationsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await organizationalLevelAssociations.create(
        organizationalLevelAssociationsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/OrganizationalLevelAssociations',
        organizationalLevelAssociationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete organizationallevelassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await organizationalLevelAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/OrganizationalLevelAssociations/1'
      );
    });
  });
});
