/**
 * Notification service for sending emails and other notifications
 */

import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('notification-service');

export class NotificationService {
  async sendWelcomeEmail(email: string, firstName: string, companyName: string): Promise<void> {
    // In a real implementation, this would integrate with an email service
    logger.info(`Sending welcome email to ${email} for ${companyName}`);
    
    // Simulate email sending
    await this.delay(500);
    
    logger.info(`Welcome email sent successfully to ${email}`);
  }

  async sendInternalNotification(subject: string, message: string): Promise<void> {
    logger.info(`Sending internal notification: ${subject} - ${message}`);
    
    // In a real implementation, this might send to Slack, Teams, or email
    await this.delay(200);
    
    logger.info('Internal notification sent successfully');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}