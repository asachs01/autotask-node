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
  QuoteLocations,
  IQuoteLocations,
  IQuoteLocationsQuery,
} from '../../src/entities/quotelocations';

describe('QuoteLocations Entity', () => {
  let quoteLocations: QuoteLocations;
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

    quoteLocations = new QuoteLocations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list quotelocations successfully', async () => {
      const mockData = [
        { id: 1, name: 'QuoteLocations 1' },
        { id: 2, name: 'QuoteLocations 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await quoteLocations.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/QuoteLocations/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IQuoteLocationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await quoteLocations.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/QuoteLocations/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get quotelocations by id', async () => {
      const mockData = { id: 1, name: 'Test QuoteLocations' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await quoteLocations.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/QuoteLocations/1');
    });
  });

  describe('create', () => {
    it('should create quotelocations successfully', async () => {
      const quoteLocationsData = { name: 'New QuoteLocations' };
      const mockResponse = { id: 1, ...quoteLocationsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await quoteLocations.create(quoteLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/QuoteLocations', quoteLocationsData);
    });
  });

  describe('update', () => {
    it('should update quotelocations successfully', async () => {
      const quoteLocationsData = { name: 'Updated QuoteLocations' };
      const mockResponse = { id: 1, ...quoteLocationsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await quoteLocations.update(1, quoteLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/QuoteLocations/1', quoteLocationsData);
    });
  });

  describe('patch', () => {
    it('should partially update quotelocations successfully', async () => {
      const quoteLocationsData = { name: 'Patched QuoteLocations' };
      const mockResponse = { id: 1, ...quoteLocationsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await quoteLocations.patch(1, quoteLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/QuoteLocations/1', quoteLocationsData);
    });
  });

  describe('delete', () => {
    it('should delete quotelocations successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await quoteLocations.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/QuoteLocations/1');
    });
  });
});