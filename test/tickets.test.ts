import { Tickets } from '../src/entities/tickets';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('Tickets', () => {
  let tickets: Tickets;
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
    tickets = new Tickets(mockAxios as AxiosInstance, logger);
  });

  it('should create a ticket', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await tickets.create({ title: 'Test' });
    expect(res.data.id).toBe(1);
  });

  it('should get a ticket', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await tickets.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a ticket', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, title: 'Updated' } });
    const res = await tickets.update(3, { title: 'Updated' });
    expect(res.data.title).toBe('Updated');
  });

  it('should delete a ticket', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(tickets.delete(4)).resolves.toBeUndefined();
  });

  it('should list tickets', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await tickets.list();
    expect(res.data[0].id).toBe(5);
  });
}); 