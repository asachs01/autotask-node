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
  ContractTicketPurchases,
  IContractTicketPurchases,
  IContractTicketPurchasesQuery,
} from '../../src/entities/contractticketpurchases';

describe('ContractTicketPurchases Entity', () => {
  let contractTicketPurchases: ContractTicketPurchases;
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

    contractTicketPurchases = new ContractTicketPurchases(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractticketpurchases successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractTicketPurchases 1' },
        { id: 2, name: 'ContractTicketPurchases 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractTicketPurchases.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractTicketPurchases/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractTicketPurchasesQuery = {
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

      await contractTicketPurchases.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractTicketPurchases/query', {
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
    it('should get contractticketpurchases by id', async () => {
      const mockData = { id: 1, name: 'Test ContractTicketPurchases' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractTicketPurchases.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractTicketPurchases/1');
    });
  });

  describe('create', () => {
    it('should create contractticketpurchases successfully', async () => {
      const contractTicketPurchasesData = { name: 'New ContractTicketPurchases' };
      const mockResponse = { id: 1, ...contractTicketPurchasesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractTicketPurchases.create(contractTicketPurchasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractTicketPurchases', contractTicketPurchasesData);
    });
  });

  describe('update', () => {
    it('should update contractticketpurchases successfully', async () => {
      const contractTicketPurchasesData = { name: 'Updated ContractTicketPurchases' };
      const mockResponse = { id: 1, ...contractTicketPurchasesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractTicketPurchases.update(1, contractTicketPurchasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractTicketPurchases/1', contractTicketPurchasesData);
    });
  });

  describe('patch', () => {
    it('should partially update contractticketpurchases successfully', async () => {
      const contractTicketPurchasesData = { name: 'Patched ContractTicketPurchases' };
      const mockResponse = { id: 1, ...contractTicketPurchasesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractTicketPurchases.patch(1, contractTicketPurchasesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractTicketPurchases/1', contractTicketPurchasesData);
    });
  });

  describe('delete', () => {
    it('should delete contractticketpurchases successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractTicketPurchases.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractTicketPurchases/1');
    });
  });
});