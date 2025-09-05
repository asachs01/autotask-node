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
  Appointments,
  IAppointments,
  IAppointmentsQuery,
} from '../../src/entities/appointments';

describe('Appointments Entity', () => {
  let setup: EntityTestSetup<Appointments>;

  beforeEach(() => {
    setup = createEntityTestSetup(Appointments);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list appointments successfully', async () => {
      const mockData = [
        { id: 1, name: 'Appointments 1' },
        { id: 2, name: 'Appointments 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Appointments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: IAppointmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Appointments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get appointments by id', async () => {
      const mockData = { id: 1, name: 'Test Appointments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Appointments/1');
    });
  });

  describe('create', () => {
    it('should create appointments successfully', async () => {
      const appointmentsData = { name: 'New Appointments' };
      const mockResponse = { id: 1, ...appointmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(appointmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Appointments', appointmentsData);
    });
  });

  describe('update', () => {
    it('should update appointments successfully', async () => {
      const appointmentsData = { name: 'Updated Appointments' };
      const mockResponse = { id: 1, ...appointmentsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, appointmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Appointments/1', appointmentsData);
    });
  });

  describe('patch', () => {
    it('should partially update appointments successfully', async () => {
      const appointmentsData = { name: 'Patched Appointments' };
      const mockResponse = { id: 1, ...appointmentsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, appointmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/Appointments/1', appointmentsData);
    });
  });

  describe('delete', () => {
    it('should delete appointments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/Appointments/1');
    });
  });
});