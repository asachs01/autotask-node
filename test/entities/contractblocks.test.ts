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
  ContractBlocks,
  IContractBlocks,
  IContractBlocksQuery,
} from '../../src/entities/contractblocks';

describe('ContractBlocks Entity', () => {
  let contractBlocks: ContractBlocks;
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

    contractBlocks = new ContractBlocks(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractblocks successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractBlocks 1' },
        { id: 2, name: 'ContractBlocks 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlocks.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBlocks/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractBlocksQuery = {
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

      await contractBlocks.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBlocks/query', {
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
    it('should get contractblocks by id', async () => {
      const mockData = { id: 1, name: 'Test ContractBlocks' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlocks.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBlocks/1');
    });
  });

  describe('create', () => {
    it('should create contractblocks successfully', async () => {
      const contractBlocksData = { name: 'New ContractBlocks' };
      const mockResponse = { id: 1, ...contractBlocksData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlocks.create(contractBlocksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractBlocks', contractBlocksData);
    });
  });

  describe('update', () => {
    it('should update contractblocks successfully', async () => {
      const contractBlocksData = { name: 'Updated ContractBlocks' };
      const mockResponse = { id: 1, ...contractBlocksData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlocks.update(1, contractBlocksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractBlocks/1', contractBlocksData);
    });
  });

  describe('patch', () => {
    it('should partially update contractblocks successfully', async () => {
      const contractBlocksData = { name: 'Patched ContractBlocks' };
      const mockResponse = { id: 1, ...contractBlocksData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractBlocks.patch(1, contractBlocksData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractBlocks/1', contractBlocksData);
    });
  });

  describe('delete', () => {
    it('should delete contractblocks successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractBlocks.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractBlocks/1');
    });
  });
});