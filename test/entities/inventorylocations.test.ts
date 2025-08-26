import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import winston from 'winston';
import {
  InventoryLocations,
  IInventoryLocations,
  IInventoryLocationsQuery,
} from '../../src/entities/inventorylocations';

describe('InventoryLocations Entity', () => {
  let inventoryLocations: InventoryLocations;
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

    inventoryLocations = new InventoryLocations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list inventorylocations successfully', async () => {
      const mockData = [
        { id: 1, name: 'InventoryLocations 1' },
        { id: 2, name: 'InventoryLocations 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryLocations.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryLocations/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IInventoryLocationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.get.mockResolvedValueOnce({
        data: { items: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await inventoryLocations.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryLocations/query', {
        params: {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          pageSize: 10,
        }
      });
    });
  });

  describe('get', () => {
    it('should get inventorylocations by id', async () => {
      const mockData = { id: 1, name: 'Test InventoryLocations' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryLocations.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/InventoryLocations/1');
    });
  });

  describe('create', () => {
    it('should create inventorylocations successfully', async () => {
      const inventoryLocationsData = { name: 'New InventoryLocations' };
      const mockResponse = { id: 1, ...inventoryLocationsData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryLocations.create(inventoryLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/InventoryLocations', inventoryLocationsData);
    });
  });

  describe('update', () => {
    it('should update inventorylocations successfully', async () => {
      const inventoryLocationsData = { name: 'Updated InventoryLocations' };
      const mockResponse = { id: 1, ...inventoryLocationsData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryLocations.update(1, inventoryLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/InventoryLocations/1', inventoryLocationsData);
    });
  });

  describe('patch', () => {
    it('should partially update inventorylocations successfully', async () => {
      const inventoryLocationsData = { name: 'Patched InventoryLocations' };
      const mockResponse = { id: 1, ...inventoryLocationsData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await inventoryLocations.patch(1, inventoryLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/InventoryLocations/1', inventoryLocationsData);
    });
  });

  describe('delete', () => {
    it('should delete inventorylocations successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await inventoryLocations.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/InventoryLocations/1');
    });
  });
});