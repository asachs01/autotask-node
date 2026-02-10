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
  ContractExclusionSets,
  IContractExclusionSets,
  IContractExclusionSetsQuery,
} from '../../src/entities/contractexclusionsets';

describe('ContractExclusionSets Entity', () => {
  let contractExclusionSets: ContractExclusionSets;
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

    contractExclusionSets = new ContractExclusionSets(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractexclusionsets successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractExclusionSets 1' },
        { id: 2, name: 'ContractExclusionSets 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contractExclusionSets.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractExclusionSets/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: IContractExclusionSetsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contractExclusionSets.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractExclusionSets/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('get', () => {
    it('should get contractexclusionsets by id', async () => {
      const mockData = { id: 1, name: 'Test ContractExclusionSets' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contractExclusionSets.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractExclusionSets/1');
    });
  });

  describe('create', () => {
    it('should create contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = { name: 'New ContractExclusionSets' };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractExclusionSets.create(
        contractExclusionSetsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractExclusionSets',
        contractExclusionSetsData
      );
    });
  });

  describe('update', () => {
    it('should update contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = {
        name: 'Updated ContractExclusionSets',
      };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await contractExclusionSets.update(
        1,
        contractExclusionSetsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ContractExclusionSets/1',
        contractExclusionSetsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update contractexclusionsets successfully', async () => {
      const contractExclusionSetsData = {
        name: 'Patched ContractExclusionSets',
      };
      const mockResponse = { id: 1, ...contractExclusionSetsData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractExclusionSets.patch(
        1,
        contractExclusionSetsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ContractExclusionSets/1',
        contractExclusionSetsData
      );
    });
  });

  describe('delete', () => {
    it('should delete contractexclusionsets successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contractExclusionSets.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ContractExclusionSets/1');
    });
  });
});
