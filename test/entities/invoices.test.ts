import { Invoices, Invoice } from '../../src/entities/invoices';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger, createTestRequestHandler } from '../utils/testHelpers';

describe('Invoices', () => {
  let invoices: Invoices;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);
    invoices = new Invoices(mockAxios, mockLogger, testRequestHandler);
  });

  describe('create', () => {
    it('should create an invoice', async () => {
      const invoiceData: Invoice = {
        accountId: 123,
        invoiceNumber: 'INV-2024-001',
        invoiceDate: '2024-01-01',
        dueDate: '2024-01-31',
        totalAmount: 1000.00,
        status: 1,
      };

      const expectedResponse = { data: { id: 1, ...invoiceData } };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.create(invoiceData);

      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices', invoiceData);
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle create errors', async () => {
      const invoiceData: Invoice = { accountId: 123 };
      mockAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(invoices.create(invoiceData)).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should get an invoice by id', async () => {
      const invoiceId = 1;
      const expectedResponse = { data: { id: invoiceId, invoiceNumber: 'INV-2024-001' } };
      mockAxios.get.mockResolvedValue(expectedResponse);

      const result = await invoices.get(invoiceId);

      expect(mockAxios.get).toHaveBeenCalledWith('/Invoices/1');
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle get errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Not Found'));

      await expect(invoices.get(999)).rejects.toThrow('Not Found');
    });
  });

  describe('update', () => {
    it('should update an invoice', async () => {
      const invoiceId = 1;
      const updateData: Partial<Invoice> = { status: 2 };
      const expectedResponse = { data: { id: invoiceId, ...updateData } };
      mockAxios.put.mockResolvedValue(expectedResponse);

      const result = await invoices.update(invoiceId, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith('/Invoices/1', updateData);
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle update errors', async () => {
      mockAxios.put.mockRejectedValue(new Error('Update Failed'));

      await expect(invoices.update(1, {})).rejects.toThrow('Update Failed');
    });
  });

  describe('delete', () => {
    it('should delete an invoice', async () => {
      const invoiceId = 1;
      mockAxios.delete.mockResolvedValue({ data: {} });

      await invoices.delete(invoiceId);

      expect(mockAxios.delete).toHaveBeenCalledWith('/Invoices/1');
    });

    it('should handle delete errors', async () => {
      mockAxios.delete.mockRejectedValue(new Error('Delete Failed'));

      await expect(invoices.delete(1)).rejects.toThrow('Delete Failed');
    });
  });

  describe('list', () => {
    it('should list invoices with default filter', async () => {
      const expectedResponse = { data: [{ id: 1, invoiceNumber: 'INV-2024-001' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.list();

      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should list invoices with custom filter', async () => {
      const query = { filter: { accountId: 123 }, page: 1, pageSize: 10 };
      const expectedResponse = { data: [{ id: 1, accountId: 123 }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [{ op: 'eq', field: 'accountId', value: 123 }],
        page: 1,
        pageSize: 10
      });
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle list errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('List Failed'));

      await expect(invoices.list()).rejects.toThrow('List Failed');
    });
  });

  describe('getByAccount', () => {
    it('should get invoices by account ID', async () => {
      const accountId = 123;
      const expectedResponse = { data: [{ id: 1, accountId, invoiceNumber: 'INV-2024-001' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.getByAccount(accountId);

      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [{ op: 'eq', field: 'accountId', value: accountId }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByStatus', () => {
    it('should get invoices by status', async () => {
      const status = 1;
      const expectedResponse = { data: [{ id: 1, status, invoiceNumber: 'INV-2024-001' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.getByStatus(status);

      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [{ op: 'eq', field: 'status', value: status }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getUnpaid', () => {
    it('should get unpaid invoices', async () => {
      const expectedResponse = { data: [{ id: 1, amountDue: 500.00 }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.getUnpaid();

      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [{ op: 'gt', field: 'amountDue', value: 0 }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getOverdue', () => {
    it('should get overdue invoices', async () => {
      const expectedResponse = { data: [{ id: 1, amountDue: 500.00, dueDate: '2023-12-01' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.getOverdue();

      const today = new Date().toISOString().split('T')[0];
      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [
          { op: 'gt', field: 'amountDue', value: 0 },
          { op: 'lt', field: 'dueDate', value: today }
        ]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByDateRange', () => {
    it('should get invoices by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const expectedResponse = { data: [{ id: 1, invoiceDate: '2024-01-15' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.getByDateRange(startDate, endDate);

      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [
          { op: 'gte', field: 'invoiceDate', value: startDate },
          { op: 'lte', field: 'invoiceDate', value: endDate }
        ]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByInvoiceNumber', () => {
    it('should get invoices by invoice number', async () => {
      const invoiceNumber = 'INV-2024-001';
      const expectedResponse = { data: [{ id: 1, invoiceNumber }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await invoices.getByInvoiceNumber(invoiceNumber);

      expect(mockAxios.post).toHaveBeenCalledWith('/Invoices/query', {
        filter: [{ op: 'eq', field: 'invoiceNumber', value: invoiceNumber }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = Invoices.getMetadata();
      
      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createInvoice',
        'getInvoice',
        'updateInvoice',
        'deleteInvoice',
        'listInvoices'
      ]);
    });
  });
}); 