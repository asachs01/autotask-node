import { Quotes, Quote } from '../../src/entities/quotes';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger, createTestRequestHandler } from '../utils/testHelpers';

describe('Quotes', () => {
  let quotes: Quotes;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);
    quotes = new Quotes(mockAxios, mockLogger, testRequestHandler);
  });

  describe('create', () => {
    it('should create a quote', async () => {
      const quoteData: Quote = {
        accountId: 123,
        quoteNumber: 'QUO-2024-001',
        quoteDate: '2024-01-01',
        expirationDate: '2024-01-31',
        totalAmount: 5000.00,
        status: 1,
        isActive: true,
      };

      const expectedResponse = { data: { id: 1, ...quoteData } };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.create(quoteData);

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes', quoteData);
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle create errors', async () => {
      const quoteData: Quote = { accountId: 123 };
      mockAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(quotes.create(quoteData)).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should get a quote by id', async () => {
      const quoteId = 1;
      const expectedResponse = { data: { id: quoteId, quoteNumber: 'QUO-2024-001' } };
      mockAxios.get.mockResolvedValue(expectedResponse);

      const result = await quotes.get(quoteId);

      expect(mockAxios.get).toHaveBeenCalledWith('/Quotes/1');
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle get errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Not Found'));

      await expect(quotes.get(999)).rejects.toThrow('Not Found');
    });
  });

  describe('update', () => {
    it('should update a quote', async () => {
      const quoteId = 1;
      const updateData: Partial<Quote> = { status: 2 };
      const expectedResponse = { data: { id: quoteId, ...updateData } };
      mockAxios.put.mockResolvedValue(expectedResponse);

      const result = await quotes.update(quoteId, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith('/Quotes/1', updateData);
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle update errors', async () => {
      mockAxios.put.mockRejectedValue(new Error('Update Failed'));

      await expect(quotes.update(1, {})).rejects.toThrow('Update Failed');
    });
  });

  describe('delete', () => {
    it('should delete a quote', async () => {
      const quoteId = 1;
      mockAxios.delete.mockResolvedValue({ data: {} });

      await quotes.delete(quoteId);

      expect(mockAxios.delete).toHaveBeenCalledWith('/Quotes/1');
    });

    it('should handle delete errors', async () => {
      mockAxios.delete.mockRejectedValue(new Error('Delete Failed'));

      await expect(quotes.delete(1)).rejects.toThrow('Delete Failed');
    });
  });

  describe('list', () => {
    it('should list quotes with default filter', async () => {
      const expectedResponse = { data: [{ id: 1, quoteNumber: 'QUO-2024-001' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.list();

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should list quotes with custom filter', async () => {
      const query = { filter: { accountId: 123 }, page: 1, pageSize: 10 };
      const expectedResponse = { data: [{ id: 1, accountId: 123 }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'eq', field: 'accountId', value: 123 }],
        page: 1,
        pageSize: 10
      });
      expect(result.data).toEqual(expectedResponse.data);
    });

    it('should handle list errors', async () => {
      mockAxios.post.mockRejectedValue(new Error('List Failed'));

      await expect(quotes.list()).rejects.toThrow('List Failed');
    });
  });

  describe('getByAccount', () => {
    it('should get quotes by account ID', async () => {
      const accountId = 123;
      const expectedResponse = { data: [{ id: 1, accountId, quoteNumber: 'QUO-2024-001' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getByAccount(accountId);

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'eq', field: 'accountId', value: accountId }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByStatus', () => {
    it('should get quotes by status', async () => {
      const status = 1;
      const expectedResponse = { data: [{ id: 1, status, quoteNumber: 'QUO-2024-001' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getByStatus(status);

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'eq', field: 'status', value: status }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getActive', () => {
    it('should get active quotes', async () => {
      const expectedResponse = { data: [{ id: 1, isActive: true }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getActive();

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'eq', field: 'isActive', value: true }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getExpired', () => {
    it('should get expired quotes', async () => {
      const expectedResponse = { data: [{ id: 1, expirationDate: '2023-12-01', isActive: true }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getExpired();

      const today = new Date().toISOString().split('T')[0];
      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [
          { op: 'lt', field: 'expirationDate', value: today },
          { op: 'eq', field: 'isActive', value: true }
        ]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByDateRange', () => {
    it('should get quotes by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const expectedResponse = { data: [{ id: 1, quoteDate: '2024-01-15' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getByDateRange(startDate, endDate);

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [
          { op: 'gte', field: 'quoteDate', value: startDate },
          { op: 'lte', field: 'quoteDate', value: endDate }
        ]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByQuoteNumber', () => {
    it('should get quotes by quote number', async () => {
      const quoteNumber = 'QUO-2024-001';
      const expectedResponse = { data: [{ id: 1, quoteNumber }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getByQuoteNumber(quoteNumber);

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'eq', field: 'quoteNumber', value: quoteNumber }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByOpportunity', () => {
    it('should get quotes by opportunity ID', async () => {
      const opportunityId = 456;
      const expectedResponse = { data: [{ id: 1, opportunityId }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getByOpportunity(opportunityId);

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'eq', field: 'opportunityId', value: opportunityId }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getByProject', () => {
    it('should get quotes by project ID', async () => {
      const projectId = 789;
      const expectedResponse = { data: [{ id: 1, projectId }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getByProject(projectId);

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'eq', field: 'projectId', value: projectId }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getSold', () => {
    it('should get sold quotes', async () => {
      const expectedResponse = { data: [{ id: 1, soldDate: '2024-01-15' }] };
      mockAxios.post.mockResolvedValue(expectedResponse);

      const result = await quotes.getSold();

      expect(mockAxios.post).toHaveBeenCalledWith('/Quotes/query', {
        filter: [{ op: 'isnotnull', field: 'soldDate' }]
      });
      expect(result.data).toEqual(expectedResponse.data);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for all operations', () => {
      const metadata = Quotes.getMetadata();
      
      expect(metadata).toHaveLength(5);
      expect(metadata.map(m => m.operation)).toEqual([
        'createQuote',
        'getQuote',
        'updateQuote',
        'deleteQuote',
        'listQuotes'
      ]);
    });
  });
}); 