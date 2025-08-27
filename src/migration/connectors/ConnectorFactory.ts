/**
 * Factory for creating PSA system connectors
 */

import { PSASystem, SourceConnectionConfig } from '../types/MigrationTypes';
import { BaseConnector, ConnectorOptions } from './BaseConnector';
import { ConnectWiseManageConnector } from './ConnectWiseManageConnector';
import { ServiceNowConnector } from './ServiceNowConnector';
import { KaseyaVSAConnector } from './KaseyaVSAConnector';
import { FreshServiceConnector } from './FreshServiceConnector';
import { ServiceDeskPlusConnector } from './ServiceDeskPlusConnector';
import { CSVImportConnector } from './CSVImportConnector';

export class ConnectorFactory {
  private static connectorRegistry = new Map<PSASystem, new (system: PSASystem, config: SourceConnectionConfig, options?: ConnectorOptions) => BaseConnector>([
    [PSASystem.CONNECTWISE_MANAGE, ConnectWiseManageConnector as any],
    [PSASystem.SERVICENOW, ServiceNowConnector as any],
    [PSASystem.KASEYA_VSA, KaseyaVSAConnector as any],
    [PSASystem.FRESHSERVICE, FreshServiceConnector as any],
    [PSASystem.SERVICEDESK_PLUS, ServiceDeskPlusConnector as any],
    [PSASystem.CSV_IMPORT, CSVImportConnector as any],
    [PSASystem.EXCEL_IMPORT, CSVImportConnector as any] // Uses same connector as CSV
  ]);

  /**
   * Create a connector for the specified PSA system
   */
  static createConnector(
    system: PSASystem,
    config: SourceConnectionConfig,
    options?: ConnectorOptions
  ): BaseConnector {
    const ConnectorClass = this.connectorRegistry.get(system);
    
    if (!ConnectorClass) {
      throw new Error(`Unsupported PSA system: ${system}`);
    }

    return new ConnectorClass(system, config, options);
  }

  /**
   * Register a custom connector
   */
  static registerConnector(system: PSASystem, connectorClass: new (system: PSASystem, config: SourceConnectionConfig, options?: ConnectorOptions) => BaseConnector): void {
    this.connectorRegistry.set(system, connectorClass);
  }

  /**
   * Get supported PSA systems
   */
  static getSupportedSystems(): PSASystem[] {
    return Array.from(this.connectorRegistry.keys());
  }

  /**
   * Check if a PSA system is supported
   */
  static isSupported(system: PSASystem): boolean {
    return this.connectorRegistry.has(system);
  }

  /**
   * Get connector capabilities for a PSA system
   */
  static getConnectorCapabilities(system: PSASystem): any {
    const ConnectorClass = this.connectorRegistry.get(system);
    
    if (!ConnectorClass) {
      throw new Error(`Unsupported PSA system: ${system}`);
    }

    // Create temporary instance to get capabilities
    const tempConnector = new ConnectorClass(system, { baseUrl: '', credentials: {} });
    return tempConnector.getCapabilities();
  }
}