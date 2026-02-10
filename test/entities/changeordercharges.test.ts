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
  ChangeOrderCharges,
  IChangeOrderCharges,
  IChangeOrderChargesQuery,
} from '../../src/entities/changeordercharges';

describe('ChangeOrderCharges Entity', () => {
  let changeOrderCharges: ChangeOrderCharges;
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

    changeOrderCharges = new ChangeOrderCharges(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list changeordercharges successfully', async () => {
      const mockData = [
        { id: 1, name: 'ChangeOrderCharges 1' },
        { id: 2, name: 'ChangeOrderCharges 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await changeOrderCharges.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.post).toHaveBeenCalledWith('/ChangeOrderCharges/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IChangeOrderChargesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await changeOrderCharges.list(query);

      expect(mockAxios.post).toHaveBeenCalledWith('/ChangeOrderCharges/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get changeordercharges by id', async () => {
      const mockData = { id: 1, name: 'Test ChangeOrderCharges' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await changeOrderCharges.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ChangeOrderCharges/1');
    });
  });

  describe('create', () => {
    it('should create changeordercharges successfully', async () => {
      const changeOrderChargesData = { name: 'New ChangeOrderCharges' };
      const mockResponse = { id: 1, ...changeOrderChargesData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await changeOrderCharges.create(changeOrderChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ChangeOrderCharges',
        changeOrderChargesData
      );
    });
  });

  describe('update', () => {
    it('should update changeordercharges successfully', async () => {
      const changeOrderChargesData = { name: 'Updated ChangeOrderCharges' };
      const mockResponse = { id: 1, ...changeOrderChargesData };

      mockAxios.put.mockResolvedValueOnce(createMockItemResponse(mockResponse));

      const result = await changeOrderCharges.update(1, changeOrderChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.put).toHaveBeenCalledWith(
        '/ChangeOrderCharges/1',
        changeOrderChargesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update changeordercharges successfully', async () => {
      const changeOrderChargesData = { name: 'Patched ChangeOrderCharges' };
      const mockResponse = { id: 1, ...changeOrderChargesData };

      mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await changeOrderCharges.patch(1, changeOrderChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/ChangeOrderCharges/1',
        changeOrderChargesData
      );
    });
  });

  describe('delete', () => {
    it('should delete changeordercharges successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await changeOrderCharges.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/ChangeOrderCharges/1');
    });
  });
});
