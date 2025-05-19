import { ServiceCalls } from '../src/entities/serviceCalls';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('ServiceCalls', () => {
  let serviceCalls: ServiceCalls;
  let mockAxios: Partial<AxiosInstance>;
  let logger: winston.Logger;

  beforeEach(() => {
    mockAxios = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;
    logger = winston.createLogger({ transports: [] });
    serviceCalls = new ServiceCalls(mockAxios as AxiosInstance, logger);
  });

  it('should create a service call', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await serviceCalls.create({ ticketId: 1 });
    expect(res.data.id).toBe(1);
  });

  it('should get a service call', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await serviceCalls.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a service call', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, ticketId: 2 } });
    const res = await serviceCalls.update(3, { ticketId: 2 });
    expect(res.data.ticketId).toBe(2);
  });

  it('should delete a service call', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(serviceCalls.delete(4)).resolves.toBeUndefined();
  });

  it('should list service calls', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await serviceCalls.list();
    expect(res.data[0].id).toBe(5);
  });
}); 