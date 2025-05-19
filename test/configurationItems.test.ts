import { ConfigurationItems } from '../src/entities/configurationItems';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('ConfigurationItems', () => {
  let configurationItems: ConfigurationItems;
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
    configurationItems = new ConfigurationItems(mockAxios as AxiosInstance, logger);
  });

  it('should create a configuration item', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await configurationItems.create({ name: 'Test CI' });
    expect(res.data.id).toBe(1);
  });

  it('should get a configuration item', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await configurationItems.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a configuration item', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, name: 'Updated' } });
    const res = await configurationItems.update(3, { name: 'Updated' });
    expect(res.data.name).toBe('Updated');
  });

  it('should delete a configuration item', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(configurationItems.delete(4)).resolves.toBeUndefined();
  });

  it('should list configuration items', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await configurationItems.list();
    expect(res.data[0].id).toBe(5);
  });
}); 