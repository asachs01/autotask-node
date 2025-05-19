import axios, { AxiosInstance } from 'axios';
import winston from 'winston';
import { AutotaskAuth } from '../types';
import { Tickets, Accounts, Contacts, Projects, TimeEntries, ConfigurationItems, ServiceCalls, Tasks, Resources, Notes, Attachments } from '../entities';

export class AutotaskClient {
  private axios: AxiosInstance;
  public tickets: Tickets;
  public accounts: Accounts;
  public contacts: Contacts;
  public projects: Projects;
  public timeEntries: TimeEntries;
  public configurationItems: ConfigurationItems;
  public serviceCalls: ServiceCalls;
  public tasks: Tasks;
  public resources: Resources;
  public notes: Notes;
  public attachments: Attachments;
  private logger: winston.Logger;

  private constructor(private config: AutotaskAuth, axiosInstance: AxiosInstance) {
    this.logger = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()],
    });
    this.axios = axiosInstance;
    this.tickets = new Tickets(this.axios, this.logger);
    this.accounts = new Accounts(this.axios, this.logger);
    this.contacts = new Contacts(this.axios, this.logger);
    this.projects = new Projects(this.axios, this.logger);
    this.timeEntries = new TimeEntries(this.axios, this.logger);
    this.configurationItems = new ConfigurationItems(this.axios, this.logger);
    this.serviceCalls = new ServiceCalls(this.axios, this.logger);
    this.tasks = new Tasks(this.axios, this.logger);
    this.resources = new Resources(this.axios, this.logger);
    this.notes = new Notes(this.axios, this.logger);
    this.attachments = new Attachments(this.axios, this.logger);
  }

  static async create(config: AutotaskAuth): Promise<AutotaskClient> {
    let apiUrl = config.apiUrl;
    if (!apiUrl) {
      // Zone detection
      const zoneInfoUrl = 'https://webservices.autotask.net/atservicesrest/v1.0/zoneInformation';
      try {
        const resp = await axios.get(zoneInfoUrl, {
          headers: {
            'Content-Type': 'application/json',
            'ApiIntegrationcode': config.integrationCode,
            'UserName': config.username,
            'Secret': config.secret,
          },
        });
        apiUrl = resp.data?.url || resp.data?.ApiZoneURL || resp.data?.apiZoneUrl;
        if (!apiUrl) throw new Error('Could not determine API zone URL from zoneInformation response');
      } catch (err) {
        throw new Error('Failed to detect Autotask API zone: ' + err);
      }
    }
    const axiosInstance = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'ApiIntegrationcode': config.integrationCode,
        'UserName': config.username,
        'Secret': config.secret,
      },
    });
    return new AutotaskClient(config, axiosInstance);
  }

  getLogger() {
    return this.logger;
  }
} 