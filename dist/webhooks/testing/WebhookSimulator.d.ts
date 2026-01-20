/**
 * Webhook simulator for testing and development
 */
import winston from 'winston';
import { WebhookTest, SimulationConfig } from '../types/WebhookTypes';
export interface SimulationResult {
    testId: string;
    name: string;
    success: boolean;
    response?: any;
    responseTime: number;
    error?: string;
    timestamp: Date;
}
export interface SimulatorConfig {
    baseUrl: string;
    secret?: string;
    signatureHeader?: string;
    signaturePrefix?: string;
    timeout?: number;
}
export declare class WebhookSimulator {
    private config;
    private logger;
    private tests;
    constructor(config: SimulatorConfig, logger?: winston.Logger);
    private createDefaultLogger;
    private loadDefaultTests;
    addTest(test: WebhookTest): void;
    removeTest(testId: string): boolean;
    getTest(testId: string): WebhookTest | undefined;
    getTests(): WebhookTest[];
    getTestsByCategory(category: string): WebhookTest[];
    getTestsByTag(tag: string): WebhookTest[];
    runTest(testId: string): Promise<SimulationResult>;
    runTests(testIds?: string[]): Promise<SimulationResult[]>;
    runSimulation(config: SimulationConfig): Promise<void>;
    private sendWebhook;
    private generateSignature;
    private validateResponse;
    private generateRandomPayload;
    private generateTicketPayload;
    private generateProjectPayload;
    private generateContactPayload;
    private generateCompanyPayload;
    private generateGenericPayload;
    private randomChoice;
    private randomId;
    generateTestReport(results: SimulationResult[]): {
        summary: any;
        details: SimulationResult[];
        recommendations: string[];
    };
    private getCommonErrors;
}
//# sourceMappingURL=WebhookSimulator.d.ts.map