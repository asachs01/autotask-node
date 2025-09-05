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
  Contacts,
  IContacts,
  IContactsQuery,
} from '../../src/entities/contacts';

describe('Contacts Entity', () => {
  let setup: EntityTestSetup<Contacts>;

  beforeEach(() => {
    setup = createEntityTestSetup(Contacts);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list contacts successfully', async () => {
      const mockData = [
        { id: 1, name: 'Contacts 1' },
        { id: 2, name: 'Contacts 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Contacts/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: IContactsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Contacts/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get contacts by id', async () => {
      const mockData = { id: 1, name: 'Test Contacts' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Contacts/1');
    });
  });

  describe('create', () => {
    it('should create contacts successfully', async () => {
      const contactsData = { name: 'New Contacts' };
      const mockResponse = { id: 1, ...contactsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(contactsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Contacts', contactsData);
    });
  });

  describe('update', () => {
    it('should update contacts successfully', async () => {
      const contactsData = { name: 'Updated Contacts' };
      const mockResponse = { id: 1, ...contactsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, contactsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Contacts/1', contactsData);
    });
  });

  describe('patch', () => {
    it('should partially update contacts successfully', async () => {
      const contactsData = { name: 'Patched Contacts' };
      const mockResponse = { id: 1, ...contactsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, contactsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/Contacts/1', contactsData);
    });
  });
});