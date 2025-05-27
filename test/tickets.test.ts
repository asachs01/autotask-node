import { Tickets } from '../src/entities/tickets';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger, createTestRequestHandler } from './utils/testHelpers';

describe('Tickets', () => {
  let tickets: Tickets;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);
    tickets = new Tickets(mockAxios, mockLogger, testRequestHandler);
  });

  it('should create a ticket', async () => {
    mockAxios.post.mockResolvedValue({ data: { id: 1 } });
    const res = await tickets.create({ title: 'Test' });
    expect(res.data.id).toBe(1);
  });

  it('should get a ticket', async () => {
    mockAxios.get.mockResolvedValue({ data: { id: 2 } });
    const res = await tickets.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a ticket', async () => {
    mockAxios.put.mockResolvedValue({ data: { id: 3, title: 'Updated' } });
    const res = await tickets.update(3, { title: 'Updated' });
    expect(res.data.title).toBe('Updated');
  });

  it('should delete a ticket', async () => {
    mockAxios.delete.mockResolvedValue({});
    await expect(tickets.delete(4)).resolves.toBeUndefined();
  });

  it('should list tickets', async () => {
    mockAxios.post.mockResolvedValue({ data: [{ id: 5 }] }); // Tickets use POST for list/query
    const res = await tickets.list();
    expect(res.data[0].id).toBe(5);
  });
}); 