import axios, { AxiosInstance } from 'axios';
import winston from 'winston';
import { AutotaskAuth, AutotaskRegion } from '../types';
import { getApiUrl } from '../utils/region';
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

  constructor(private config: AutotaskAuth) {
    const apiUrl = config.apiUrl || getApiUrl(config.region || 'NA');
    this.logger = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()],
    });
    this.axios = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'ApiIntegrationcode': config.integrationCode,
        'UserName': config.username,
        'Secret': config.secret,
      },
    });
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

  getLogger() {
    return this.logger;
  }
} 