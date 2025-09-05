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
  ProjectCharges,
  IProjectCharges,
  IProjectChargesQuery,
} from '../../src/entities/projectcharges';

describe('ProjectCharges Entity', () => {
  let projectCharges: ProjectCharges;
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

    projectCharges = new ProjectCharges(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list projectcharges successfully', async () => {
      const mockData = [
        { id: 1, name: 'ProjectCharges 1' },
        { id: 2, name: 'ProjectCharges 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await projectCharges.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProjectCharges/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IProjectChargesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await projectCharges.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProjectCharges/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get projectcharges by id', async () => {
      const mockData = { id: 1, name: 'Test ProjectCharges' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await projectCharges.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProjectCharges/1');
    });
  });

  describe('create', () => {
    it('should create projectcharges successfully', async () => {
      const projectChargesData = { name: 'New ProjectCharges' };
      const mockResponse = { id: 1, ...projectChargesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await projectCharges.create(projectChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ProjectCharges', projectChargesData);
    });
  });

  describe('update', () => {
    it('should update projectcharges successfully', async () => {
      const projectChargesData = { name: 'Updated ProjectCharges' };
      const mockResponse = { id: 1, ...projectChargesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await projectCharges.update(1, projectChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ProjectCharges/1', projectChargesData);
    });
  });

  describe('patch', () => {
    it('should partially update projectcharges successfully', async () => {
      const projectChargesData = { name: 'Patched ProjectCharges' };
      const mockResponse = { id: 1, ...projectChargesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await projectCharges.patch(1, projectChargesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ProjectCharges/1', projectChargesData);
    });
  });

  describe('delete', () => {
    it('should delete projectcharges successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await projectCharges.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/ProjectCharges/1');
    });
  });
});