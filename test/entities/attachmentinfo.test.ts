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
  AttachmentInfo,
  IAttachmentInfo,
  IAttachmentInfoQuery,
} from '../../src/entities/attachmentinfo';

describe('AttachmentInfo Entity', () => {
  let attachmentInfo: AttachmentInfo;
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

    attachmentInfo = new AttachmentInfo(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list attachmentinfo successfully', async () => {
      const mockData = [
        { id: 1, name: 'AttachmentInfo 1' },
        { id: 2, name: 'AttachmentInfo 2' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: { items: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await attachmentInfo.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/AttachmentInfo/query', {
        params: {
          filter: [{ op: 'gte', field: 'id', value: 0 }]
        }
      });
    });

    it('should handle query parameters', async () => {
      const query: IAttachmentInfoQuery = {
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

      await attachmentInfo.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith('/AttachmentInfo/query', {
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
    it('should get attachmentinfo by id', async () => {
      const mockData = { id: 1, name: 'Test AttachmentInfo' };

      mockAxios.get.mockResolvedValueOnce({
        data: { item: mockData },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await attachmentInfo.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/AttachmentInfo/1');
    });
  });

  describe('create', () => {
    it('should create attachmentinfo successfully', async () => {
      const attachmentInfoData = { name: 'New AttachmentInfo' };
      const mockResponse = { id: 1, ...attachmentInfoData };

      mockAxios.post.mockResolvedValueOnce({
        data: { item: mockResponse },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const result = await attachmentInfo.create(attachmentInfoData);

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith('/AttachmentInfo', attachmentInfoData);
    });
  });

  describe('delete', () => {
    it('should delete attachmentinfo successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await attachmentInfo.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith('/AttachmentInfo/1');
    });
  });
});