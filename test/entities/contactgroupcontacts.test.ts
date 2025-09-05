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
  ContactGroupContacts,
  IContactGroupContacts,
  IContactGroupContactsQuery,
} from '../../src/entities/contactgroupcontacts';

describe('ContactGroupContacts Entity', () => {
  let contactGroupContacts: ContactGroupContacts;
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

    contactGroupContacts = new ContactGroupContacts(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contactgroupcontacts successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContactGroupContacts 1' },
        { id: 2, name: 'ContactGroupContacts 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contactGroupContacts.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContactGroupContacts/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContactGroupContactsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contactGroupContacts.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContactGroupContacts/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contactgroupcontacts by id', async () => {
      const mockData = { id: 1, name: 'Test ContactGroupContacts' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contactGroupContacts.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContactGroupContacts/1');
    });
  });

  describe('create', () => {
    it('should create contactgroupcontacts successfully', async () => {
      const contactGroupContactsData = { name: 'New ContactGroupContacts' };
      const mockResponse = { id: 1, ...contactGroupContactsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contactGroupContacts.create(contactGroupContactsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContactGroupContacts', contactGroupContactsData);
    });
  });

  describe('delete', () => {
    it('should delete contactgroupcontacts successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contactGroupContacts.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContactGroupContacts/1');
    });
  });
});