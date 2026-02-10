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
  ContractCharges,
  IContractCharges,
  IContractChargesQuery,
} from '../../src/entities/contractcharges';

describe('ContractCharges Entity', () => {
  let contractCharges: ContractCharges;
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

    contractCharges = new ContractCharges(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractcharges successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractCharges 1' },
        { id: 2, name: 'ContractCharges 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contractCharges.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/ContractCharges/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractChargesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contractCharges.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/ContractCharges/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get contractcharges by id', async () => {
      const mockData = { id: 1, name: 'Test ContractCharges' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contractCharges.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractCharges/1');
    });
  });

  describe('create', () => {
    it('should create contractcharges successfully', async () => {
      const contractChargesData = { name: 'New ContractCharges' };
      const mockResponse = { id: 1, ...contractChargesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractCharges.create(contractChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractCharges',
        contractChargesData
      );
    });
  });

  describe('update', () => {
    it('should update contractcharges successfully', async () => {
      const contractChargesData = { name: 'Updated ContractCharges' };
      const mockResponse = { id: 1, ...contractChargesData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await contractCharges.update(1, contractChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ContractCharges/1',
        contractChargesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update contractcharges successfully', async () => {
      const contractChargesData = { name: 'Patched ContractCharges' };
      const mockResponse = { id: 1, ...contractChargesData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractCharges.patch(1, contractChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ContractCharges/1',
        contractChargesData
      );
    });
  });

  describe('delete', () => {
    it('should delete contractcharges successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contractCharges.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractCharges/1');
    });
  });
});
