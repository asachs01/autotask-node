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
  ContactBillingProductAssociations,
  IContactBillingProductAssociations,
  IContactBillingProductAssociationsQuery,
} from '../../src/entities/contactbillingproductassociations';

describe('ContactBillingProductAssociations Entity', () => {
  let contactBillingProductAssociations: ContactBillingProductAssociations;
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

    contactBillingProductAssociations = new ContactBillingProductAssociations(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contactbillingproductassociations successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContactBillingProductAssociations 1' },
        { id: 2, name: 'ContactBillingProductAssociations 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contactBillingProductAssociations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContactBillingProductAssociations/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IContactBillingProductAssociationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contactBillingProductAssociations.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContactBillingProductAssociations/query',
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
    it('should get contactbillingproductassociations by id', async () => {
      const mockData = {
        id: 1,
        name: 'Test ContactBillingProductAssociations',
      };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contactBillingProductAssociations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContactBillingProductAssociations/1'
      );
    });
  });

  describe('create', () => {
    it('should create contactbillingproductassociations successfully', async () => {
      const contactBillingProductAssociationsData = {
        name: 'New ContactBillingProductAssociations',
      };
      const mockResponse = { id: 1, ...contactBillingProductAssociationsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contactBillingProductAssociations.create(
        contactBillingProductAssociationsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContactBillingProductAssociations',
        contactBillingProductAssociationsData
      );
    });
  });

  describe('delete', () => {
    it('should delete contactbillingproductassociations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contactBillingProductAssociations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ContactBillingProductAssociations/1'
      );
    });
  });
});
