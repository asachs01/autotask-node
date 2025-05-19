import { TimeEntries } from '../src/entities/timeEntries';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('TimeEntries', () => {
  let timeEntries: TimeEntries;
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
    timeEntries = new TimeEntries(mockAxios as AxiosInstance, logger);
  });

  it('should create a time entry', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await timeEntries.create({ hours: 1 });
    expect(res.data.id).toBe(1);
  });

  it('should get a time entry', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await timeEntries.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a time entry', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, hours: 2 } });
    const res = await timeEntries.update(3, { hours: 2 });
    expect(res.data.hours).toBe(2);
  });

  it('should delete a time entry', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(timeEntries.delete(4)).resolves.toBeUndefined();
  });

  it('should list time entries', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await timeEntries.list();
    expect(res.data[0].id).toBe(5);
  });
}); 