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
  Documents,
  IDocuments,
  IDocumentsQuery,
} from '../../src/entities/documents';

describe('Documents Entity', () => {
  let setup: EntityTestSetup<Documents>;

  beforeEach(() => {
    setup = createEntityTestSetup(Documents);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list documents successfully', async () => {
      const mockData = [
        { id: 1, name: 'Documents 1' },
        { id: 2, name: 'Documents 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Documents/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IDocumentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Documents/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get documents by id', async () => {
      const mockData = { id: 1, name: 'Test Documents' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Documents/1');
    });
  });

  describe('create', () => {
    it('should create documents successfully', async () => {
      const documentsData = { name: 'New Documents' };
      const mockResponse = { id: 1, ...documentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(documentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Documents',
        documentsData
      );
    });
  });

  describe('update', () => {
    it('should update documents successfully', async () => {
      const documentsData = { name: 'Updated Documents' };
      const mockResponse = { id: 1, ...documentsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, documentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/Documents/1',
        documentsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update documents successfully', async () => {
      const documentsData = { name: 'Patched Documents' };
      const mockResponse = { id: 1, ...documentsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, documentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Documents/1',
        documentsData
      );
    });
  });
});
