import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import winston from 'winston';
import {
  ContractServiceAdjustments,
  IContractServiceAdjustments,
  IContractServiceAdjustmentsQuery,
} from '../../src/entities/contractserviceadjustments';

describe('ContractServiceAdjustments Entity', () => {
  let contractServiceAdjustments: ContractServiceAdjustments;
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

    contractServiceAdjustments = new ContractServiceAdjustments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractserviceadjustments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractServiceAdjustments 1' },
        { id: 2, name: 'ContractServiceAdjustments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractServiceAdjustments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractServiceAdjustmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractServiceAdjustments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get contractserviceadjustments by id', async () => {
      const mockData = { id: 1, name: 'Test ContractServiceAdjustments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractServiceAdjustments/1');
    });
  });

  describe('create', () => {
    it('should create contractserviceadjustments successfully', async () => {
      const contractServiceAdjustmentsData = { name: 'New ContractServiceAdjustments' };
      const mockResponse = { id: 1, ...contractServiceAdjustmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(contractServiceAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractServiceAdjustments', contractServiceAdjustmentsData);
    });
  });

  describe('update', () => {
    it('should update contractserviceadjustments successfully', async () => {
      const contractServiceAdjustmentsData = { name: 'Updated ContractServiceAdjustments' };
      const mockResponse = { id: 1, ...contractServiceAdjustmentsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, contractServiceAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractServiceAdjustments/1', contractServiceAdjustmentsData);
    });
  });

  describe('patch', () => {
    it('should partially update contractserviceadjustments successfully', async () => {
      const contractServiceAdjustmentsData = { name: 'Patched ContractServiceAdjustments' };
      const mockResponse = { id: 1, ...contractServiceAdjustmentsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, contractServiceAdjustmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractServiceAdjustments/1', contractServiceAdjustmentsData);
    });
  });

  describe('delete', () => {
    it('should delete contractserviceadjustments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ContractServiceAdjustments/1');
    });
  });
});