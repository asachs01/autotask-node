import axios, { AxiosInstance } from 'axios';
import winston from 'winston';
import { AutotaskAuth, RequestHandler, ConfigurationError, createAutotaskError } from '../types';
import { 
  Tickets, Accounts, Contacts, Projects, TimeEntries, ConfigurationItems, ServiceCalls, Tasks, Resources, Notes, Attachments, Contracts,
  ContractServices, ContractBlocks, ContractAdjustments, ContractExclusions,
  Invoices, Quotes, PurchaseOrders, Expenses,
  TicketCategories, TicketStatuses, TicketPriorities, TicketSources
} from '../entities';

// Optional import of dotenv for loading environment variables when used programmatically
let dotenv: any;
try {
  dotenv = require('dotenv');
  // Load environment variables from .env file
  dotenv.config();
} catch (err) {
  // dotenv is optional, do nothing if not available
}

export class AutotaskClient {
  private axios: AxiosInstance;
  private requestHandler: RequestHandler;
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
  public contracts: Contracts;
  
  // Contract-related entities (Phase 2.1)
  public contractServices: ContractServices;
  public contractBlocks: ContractBlocks;
  public contractAdjustments: ContractAdjustments;
  public contractExclusions: ContractExclusions;
  
  // Billing & Finance entities (Phase 2.2)
  public invoices: Invoices;
  public quotes: Quotes;
  public purchaseOrders: PurchaseOrders;
  public expenses: Expenses;
  
  // Service Desk Enhancement entities (Phase 2.3)
  public ticketCategories: TicketCategories;
  public ticketStatuses: TicketStatuses;
  public ticketPriorities: TicketPriorities;
  public ticketSources: TicketSources;
  private logger: winston.Logger;

  private constructor(private config: AutotaskAuth, axiosInstance: AxiosInstance) {
    this.logger = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()],
    });
    this.axios = axiosInstance;
    this.requestHandler = new RequestHandler(this.axios, this.logger);
    this.tickets = new Tickets(this.axios, this.logger, this.requestHandler);
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
    this.contracts = new Contracts(this.axios, this.logger);
    
    // Contract-related entities (Phase 2.1)
    this.contractServices = new ContractServices(this.axios, this.logger);
    this.contractBlocks = new ContractBlocks(this.axios, this.logger);
    this.contractAdjustments = new ContractAdjustments(this.axios, this.logger);
    this.contractExclusions = new ContractExclusions(this.axios, this.logger);
    
    // Billing & Finance entities (Phase 2.2)
    this.invoices = new Invoices(this.axios, this.logger);
    this.quotes = new Quotes(this.axios, this.logger);
    this.purchaseOrders = new PurchaseOrders(this.axios, this.logger);
    this.expenses = new Expenses(this.axios, this.logger);
    
    // Service Desk Enhancement entities (Phase 2.3)
    this.ticketCategories = new TicketCategories(this.axios, this.logger);
    this.ticketStatuses = new TicketStatuses(this.axios, this.logger);
    this.ticketPriorities = new TicketPriorities(this.axios, this.logger);
    this.ticketSources = new TicketSources(this.axios, this.logger);
  }

  /**
   * Creates a new AutotaskClient instance, with optional .env file loading.
   * If no config is provided, environment variables will be used.
   */
  static async create(config?: AutotaskAuth): Promise<AutotaskClient> {
    // If no config is provided, try to use environment variables
    if (!config) {
      config = {
        username: process.env.AUTOTASK_USERNAME!,
        integrationCode: process.env.AUTOTASK_INTEGRATION_CODE!,
        secret: process.env.AUTOTASK_SECRET!,
        apiUrl: process.env.AUTOTASK_API_URL,
      };
      
      if (!config.username || !config.integrationCode || !config.secret) {
        throw new ConfigurationError('Missing required environment variables: AUTOTASK_USERNAME, AUTOTASK_INTEGRATION_CODE, AUTOTASK_SECRET');
      }
    }

    let apiUrl = config.apiUrl;
    if (!apiUrl) {
      // Zone detection
      try {
        console.log("Getting zone information for username:", config.username);
        
        // Try format 1 - URL query parameter
        const zoneInfoUrl = `https://webservices.autotask.net/ATServicesRest/V1.0/zoneInformation?user=${encodeURIComponent(config.username)}`;
        console.log("Trying zone info URL:", zoneInfoUrl);
        
        // Make a GET request 
        const response = await axios.get(zoneInfoUrl);
        console.log("Zone info response:", response.data);
        
        if (response.data && response.data.url) {
          apiUrl = response.data.url;
          console.log("Got API URL:", apiUrl);
        } else if (response.data && response.data.URL) {
          apiUrl = response.data.URL;
          console.log("Got API URL (upper case):", apiUrl);
        } else if (response.data && response.data.zoneUrl) {
          apiUrl = response.data.zoneUrl;
          console.log("Got API URL (zoneUrl):", apiUrl);
        } else {
          // Try extracting the API URL from any property that looks like a URL
          for (const [key, value] of Object.entries(response.data)) {
            if (typeof value === 'string' && value.includes('autotask.net')) {
              apiUrl = value;
              console.log(`Found API URL in field ${key}:`, apiUrl);
              break;
            }
          }
        }
        
        if (!apiUrl) {
          throw new ConfigurationError('Could not determine API zone URL from zoneInformation response. Response data: ' + JSON.stringify(response.data));
        }
      } catch (err: any) {
        console.error("Error getting zone information:", err.message);
        
        // Try a fallback method
        try {
          console.log("Trying fallback zone detection method");
          const fallbackUrl = 'https://webservices.autotask.net/atservicesrest/v1.0/zoneInformation';
          
          const fallbackResponse = await axios.post(fallbackUrl, {
            UserName: config.username
          }, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          console.log("Fallback response:", fallbackResponse.data);
          
          if (fallbackResponse.data && fallbackResponse.data.url) {
            apiUrl = fallbackResponse.data.url;
            console.log("Got API URL from fallback:", apiUrl);
          } else {
            throw new ConfigurationError('Could not determine API zone URL from fallback method');
          }
        } catch (fallbackErr: any) {
          console.error("Fallback method also failed:", fallbackErr.message);
          if (err.response) {
            console.error("Original error - Response Status:", err.response.status);
            console.error("Original error - Response Data:", JSON.stringify(err.response.data));
          }
          throw new ConfigurationError('Failed to detect Autotask API zone: ' + err.message, 'apiUrl', err);
        }
      }
    }
    
    // Double check we have an API URL before creating the client
    if (!apiUrl) {
      throw new ConfigurationError('No API URL determined. Please provide the API URL explicitly or check your credentials.', 'apiUrl');
    }
    
    // Ensure the API URL ends with the version path
    if (!apiUrl.endsWith('/')) {
      apiUrl += '/';
    }
    
    if (!apiUrl.toLowerCase().endsWith('v1.0/')) {
      apiUrl += 'v1.0/';
    }
    
    console.log("Creating Autotask client with API URL:", apiUrl);
    
    // Now create the axios instance with the determined API URL
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

  getRequestHandler() {
    return this.requestHandler;
  }
} 