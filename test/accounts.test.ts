import { Accounts } from '../src/entities/accounts';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('Accounts', () => {
  let accounts: Accounts;
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
    accounts = new Accounts(mockAxios as AxiosInstance, logger);
  });

  it('should create an account', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await accounts.create({ name: 'Test Account' });
    expect(res.data.id).toBe(1);
  });

  it('should get an account', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await accounts.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update an account', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, name: 'Updated' } });
    const res = await accounts.update(3, { name: 'Updated' });
    expect(res.data.name).toBe('Updated');
  });

  it('should delete an account', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(accounts.delete(4)).resolves.toBeUndefined();
  });

  it('should list accounts', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await accounts.list();
    expect(res.data[0].id).toBe(5);
  });
}); 