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
  ContractMilestones,
  IContractMilestones,
  IContractMilestonesQuery,
} from '../../src/entities/contractmilestones';

describe('ContractMilestones Entity', () => {
  let contractMilestones: ContractMilestones;
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

    contractMilestones = new ContractMilestones(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractmilestones successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractMilestones 1' },
        { id: 2, name: 'ContractMilestones 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractMilestones.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractMilestones/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractMilestonesQuery = {
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

      await contractMilestones.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/ContractMilestones/query', {
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
    it('should get contractmilestones by id', async () => {
      const mockData = { id: 1, name: 'Test ContractMilestones' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractMilestones.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractMilestones/1');
    });
  });

  describe('create', () => {
    it('should create contractmilestones successfully', async () => {
      const contractMilestonesData = { name: 'New ContractMilestones' };
      const mockResponse = { id: 1, ...contractMilestonesData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await contractMilestones.create(contractMilestonesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractMilestones', contractMilestonesData);
    });
  });

  describe('update', () => {
    it('should update contractmilestones successfully', async () => {
      const contractMilestonesData = { name: 'Updated ContractMilestones' };
      const mockResponse = { id: 1, ...contractMilestonesData };

      mockAxios.put.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractMilestones.update(1, contractMilestonesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith('/ContractMilestones/1', contractMilestonesData);
    });
  });

  describe('patch', () => {
    it('should partially update contractmilestones successfully', async () => {
      const contractMilestonesData = { name: 'Patched ContractMilestones' };
      const mockResponse = { id: 1, ...contractMilestonesData };

      mockAxios.patch.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await contractMilestones.patch(1, contractMilestonesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith('/ContractMilestones/1', contractMilestonesData);
    });
  });

  describe('delete', () => {
    it('should delete contractmilestones successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await contractMilestones.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractMilestones/1');
    });
  });
});