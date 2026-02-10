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
import { Quotes, IQuotes, IQuotesQuery } from '../../src/entities/quotes';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';

describe('Quotes Entity', () => {
  let setup: EntityTestSetup<Quotes>;

  beforeEach(() => {
    setup = createEntityTestSetup(Quotes);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list quotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'Quotes 1' },
        { id: 2, name: 'Quotes 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IQuotesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get quotes by id', async () => {
      const mockData = { id: 1, name: 'Test Quotes' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Quotes/1');
    });
  });

  describe('create', () => {
    it('should create quotes successfully', async () => {
      const quotesData = { name: 'New Quotes' };
      const mockResponse = { id: 1, ...quotesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(quotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Quotes', quotesData);
    });
  });

  describe('update', () => {
    it('should update quotes successfully', async () => {
      const quotesData = { name: 'Updated Quotes' };
      const mockResponse = { id: 1, ...quotesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, quotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Quotes/1', quotesData);
    });
  });

  describe('patch', () => {
    it('should partially update quotes successfully', async () => {
      const quotesData = { name: 'Patched Quotes' };
      const mockResponse = { id: 1, ...quotesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, quotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Quotes/1',
        quotesData
      );
    });
  });
});
