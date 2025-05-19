import { Projects } from '../src/entities/projects';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('Projects', () => {
  let projects: Projects;
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
    projects = new Projects(mockAxios as AxiosInstance, logger);
  });

  it('should create a project', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await projects.create({ name: 'Test Project' });
    expect(res.data.id).toBe(1);
  });

  it('should get a project', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await projects.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a project', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, name: 'Updated' } });
    const res = await projects.update(3, { name: 'Updated' });
    expect(res.data.name).toBe('Updated');
  });

  it('should delete a project', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(projects.delete(4)).resolves.toBeUndefined();
  });

  it('should list projects', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await projects.list();
    expect(res.data[0].id).toBe(5);
  });
}); 