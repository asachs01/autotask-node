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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractTicketPurchases.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractTicketPurchases/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractTicketPurchasesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractTicketPurchases.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractTicketPurchases/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractticketpurchases by id', async () => {
      const mockData = { id: 1, name: 'Test ContractTicketPurchases' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractTicketPurchases.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractTicketPurchases/1');
    });
  });

  describe('create', () => {
    it('should create contractticketpurchases successfully', async () => {
      const contractTicketPurchasesData = { name: 'New ContractTicketPurchases' };
      const mockResponse = { id: 1, ...contractTicketPurchasesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractTicketPurchases.create(contractTicketPurchasesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractTicketPurchases', contractTicketPurchasesData);
    });
  });

  describe('update', () => {
    it('should update contractticketpurchases successfully', async () => {
      const contractTicketPurchasesData = { name: 'Updated ContractTicketPurchases' };
      const mockResponse = { id: 1, ...contractTicketPurchasesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractTicketPurchases.update(1, contractTicketPurchasesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractTicketPurchases/1', contractTicketPurchasesData);
    });
  });

  describe('patch', () => {
    it('should partially update contractticketpurchases successfully', async () => {
      const contractTicketPurchasesData = { name: 'Patched ContractTicketPurchases' };
      const mockResponse = { id: 1, ...contractTicketPurchasesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractTicketPurchases.patch(1, contractTicketPurchasesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractTicketPurchases/1', contractTicketPurchasesData);
    });
  });

  describe('delete', () => {
    it('should delete contractticketpurchases successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await contractTicketPurchases.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractTicketPurchases/1');
    });
  });
});