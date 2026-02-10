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
  Invoices,
  IInvoices,
  IInvoicesQuery,
} from '../../src/entities/invoices';

describe('Invoices Entity', () => {
  let setup: EntityTestSetup<Invoices>;

  beforeEach(() => {
    setup = createEntityTestSetup(Invoices);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list invoices successfully', async () => {
      const mockData = [
        { id: 1, name: 'Invoices 1' },
        { id: 2, name: 'Invoices 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IInvoicesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get invoices by id', async () => {
      const mockData = { id: 1, name: 'Test Invoices' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Invoices/1');
    });
  });

  describe('create', () => {
    it('should create invoices successfully', async () => {
      const invoicesData = { name: 'New Invoices' };
      const mockResponse = { id: 1, ...invoicesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(invoicesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Invoices',
        invoicesData
      );
    });
  });

  describe('update', () => {
    it('should update invoices successfully', async () => {
      const invoicesData = { name: 'Updated Invoices' };
      const mockResponse = { id: 1, ...invoicesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, invoicesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/Invoices/1',
        invoicesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update invoices successfully', async () => {
      const invoicesData = { name: 'Patched Invoices' };
      const mockResponse = { id: 1, ...invoicesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, invoicesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Invoices/1',
        invoicesData
      );
    });
  });
});
