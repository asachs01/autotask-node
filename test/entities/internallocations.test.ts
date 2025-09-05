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
  InternalLocations,
  IInternalLocations,
  IInternalLocationsQuery,
} from '../../src/entities/internallocations';

describe('InternalLocations Entity', () => {
  let internalLocations: InternalLocations;
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

    internalLocations = new InternalLocations(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list internallocations successfully', async () => {
      const mockData = [
        { id: 1, name: 'InternalLocations 1' },
        { id: 2, name: 'InternalLocations 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await internalLocations.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InternalLocations/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IInternalLocationsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await internalLocations.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InternalLocations/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get internallocations by id', async () => {
      const mockData = { id: 1, name: 'Test InternalLocations' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await internalLocations.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/InternalLocations/1');
    });
  });

  describe('create', () => {
    it('should create internallocations successfully', async () => {
      const internalLocationsData = { name: 'New InternalLocations' };
      const mockResponse = { id: 1, ...internalLocationsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await internalLocations.create(internalLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/InternalLocations', internalLocationsData);
    });
  });

  describe('update', () => {
    it('should update internallocations successfully', async () => {
      const internalLocationsData = { name: 'Updated InternalLocations' };
      const mockResponse = { id: 1, ...internalLocationsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await internalLocations.update(1, internalLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/InternalLocations/1', internalLocationsData);
    });
  });

  describe('patch', () => {
    it('should partially update internallocations successfully', async () => {
      const internalLocationsData = { name: 'Patched InternalLocations' };
      const mockResponse = { id: 1, ...internalLocationsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await internalLocations.patch(1, internalLocationsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/InternalLocations/1', internalLocationsData);
    });
  });

  describe('delete', () => {
    it('should delete internallocations successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await internalLocations.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/InternalLocations/1');
    });
  });
});