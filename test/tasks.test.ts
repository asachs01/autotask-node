import { Tasks } from '../src/entities/tasks';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('Tasks', () => {
  let tasks: Tasks;
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
    tasks = new Tasks(mockAxios as AxiosInstance, logger);
  });

  it('should create a task', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await tasks.create({ title: 'Test Task' });
    expect(res.data.id).toBe(1);
  });

  it('should get a task', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await tasks.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a task', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, title: 'Updated' } });
    const res = await tasks.update(3, { title: 'Updated' });
    expect(res.data.title).toBe('Updated');
  });

  it('should delete a task', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(tasks.delete(4)).resolves.toBeUndefined();
  });

  it('should list tasks', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await tasks.list();
    expect(res.data[0].id).toBe(5);
  });
}); 