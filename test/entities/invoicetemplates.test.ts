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
  InvoiceTemplates,
  IInvoiceTemplates,
  IInvoiceTemplatesQuery,
} from '../../src/entities/invoicetemplates';

describe('InvoiceTemplates Entity', () => {
  let invoiceTemplates: InvoiceTemplates;
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

    invoiceTemplates = new InvoiceTemplates(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list invoicetemplates successfully', async () => {
      const mockData = [
        { id: 1, name: 'InvoiceTemplates 1' },
        { id: 2, name: 'InvoiceTemplates 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await invoiceTemplates.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InvoiceTemplates/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IInvoiceTemplatesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await invoiceTemplates.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/InvoiceTemplates/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get invoicetemplates by id', async () => {
      const mockData = { id: 1, name: 'Test InvoiceTemplates' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await invoiceTemplates.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InvoiceTemplates/1');
    });
  });
});
