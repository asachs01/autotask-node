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
  ContractBlockHourFactors,
  IContractBlockHourFactors,
  IContractBlockHourFactorsQuery,
} from '../../src/entities/contractblockhourfactors';

describe('ContractBlockHourFactors Entity', () => {
  let contractBlockHourFactors: ContractBlockHourFactors;
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

    contractBlockHourFactors = new ContractBlockHourFactors(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractblockhourfactors successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractBlockHourFactors 1' },
        { id: 2, name: 'ContractBlockHourFactors 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contractBlockHourFactors.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractBlockHourFactors/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IContractBlockHourFactorsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contractBlockHourFactors.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractBlockHourFactors/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get contractblockhourfactors by id', async () => {
      const mockData = { id: 1, name: 'Test ContractBlockHourFactors' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contractBlockHourFactors.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractBlockHourFactors/1');
    });
  });

  describe('create', () => {
    it('should create contractblockhourfactors successfully', async () => {
      const contractBlockHourFactorsData = {
        name: 'New ContractBlockHourFactors',
      };
      const mockResponse = { id: 1, ...contractBlockHourFactorsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractBlockHourFactors.create(
        contractBlockHourFactorsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractBlockHourFactors',
        contractBlockHourFactorsData
      );
    });
  });

  describe('update', () => {
    it('should update contractblockhourfactors successfully', async () => {
      const contractBlockHourFactorsData = {
        name: 'Updated ContractBlockHourFactors',
      };
      const mockResponse = { id: 1, ...contractBlockHourFactorsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await contractBlockHourFactors.update(
        1,
        contractBlockHourFactorsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ContractBlockHourFactors/1',
        contractBlockHourFactorsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update contractblockhourfactors successfully', async () => {
      const contractBlockHourFactorsData = {
        name: 'Patched ContractBlockHourFactors',
      };
      const mockResponse = { id: 1, ...contractBlockHourFactorsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractBlockHourFactors.patch(
        1,
        contractBlockHourFactorsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ContractBlockHourFactors/1',
        contractBlockHourFactorsData
      );
    });
  });

  describe('delete', () => {
    it('should delete contractblockhourfactors successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contractBlockHourFactors.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ContractBlockHourFactors/1'
      );
    });
  });
});
