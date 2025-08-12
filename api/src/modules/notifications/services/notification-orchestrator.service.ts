import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { EmailService } from './email.service';
import { PushNotificationService } from './push-notification.service';
import { 
  NotificationType, 
  NotificationCategory, 
  NotificationStatus 
} from '../schemas/notification.schema';
import { CreateNotificationDto } from '../dto/notification.dto';

export interface NotificationEvent {
  userId: string;
  type: NotificationCategory;
  data: any;
  language?: string;
}

@Injectable()
export class NotificationOrchestratorService {
  private readonly logger = new Logger(NotificationOrchestratorService.name);

  constructor(
    private notificationService: NotificationService,
    private preferenceService: NotificationPreferenceService,
    private emailService: EmailService,
    private pushService: PushNotificationService,
    private eventEmitter: EventEmitter2,
  ) {}

  async sendNotification(
    userId: string,
    category: NotificationCategory,
    title: string,
    message: string,
    metadata?: any,
    language = 'en'
  ): Promise<void> {
    try {
      // Get user preferences
      const userLanguage = await this.preferenceService.getUserLanguage(userId);
      const finalLanguage = language || userLanguage;

      // Check if user wants notifications for this category
      const emailEnabled = await this.preferenceService.isNotificationEnabled(
        userId, 'email', category
      );
      const pushEnabled = await this.preferenceService.isNotificationEnabled(
        userId, 'push', category
      );
      const inAppEnabled = await this.preferenceService.isNotificationEnabled(
        userId, 'in_app', category
      );

      // Send in-app notification if enabled
      if (inAppEnabled) {
        await this.createInAppNotification(
          userId, title, message, category, metadata, finalLanguage
        );
      }

      // Send email notification if enabled
      if (emailEnabled) {
        await this.sendEmailNotification(
          userId, title, message, category, metadata, finalLanguage
        );
      }

      // Send push notification if enabled
      if (pushEnabled) {
        await this.sendPushNotification(
          userId, title, message, category, metadata, finalLanguage
        );
      }

      this.logger.log(`Notifications sent for user ${userId}, category: ${category}`);
    } catch (error) {
      this.logger.error(`Failed to send notifications: ${error.message}`, error.stack);
    }
  }

  private async createInAppNotification(
    userId: string,
    title: string,
    message: string,
    category: NotificationCategory,
    metadata?: any,
    language = 'en'
  ): Promise<void> {
    const notificationDto: CreateNotificationDto = {
      userId,
      title,
      message,
      type: NotificationType.IN_APP,
      category,
      metadata,
      language,
    };

    await this.notificationService.create(notificationDto);
  }

  private async sendEmailNotification(
    userId: string,
    title: string,
    message: string,
    category: NotificationCategory,
    metadata?: any,
    language = 'en'
  ): Promise<void> {
    // Create email notification record
    const notificationDto: CreateNotificationDto = {
      userId,
      title,
      message,
      type: NotificationType.EMAIL,
      category,
      metadata,
      language,
    };

    const notification = await this.notificationService.create(notificationDto);

    // Send actual email based on category
    let emailSent = false;

    switch (category) {
      case NotificationCategory.ORDER:
        if (metadata?.orderData) {
          emailSent = await this.emailService.sendOrderConfirmationEmail(
            metadata.userEmail,
            metadata.orderData,
            language
          );
        }
        break;
      case NotificationCategory.SECURITY:
        if (metadata?.resetToken) {
          emailSent = await this.emailService.sendPasswordResetEmail(
            metadata.userEmail,
            metadata.resetToken,
            language
          );
        }
        break;
      default:
        // Generic email
        emailSent = await this.emailService.sendEmail({
          to: metadata?.userEmail,
          subject: title,
          html: `<h1>${title}</h1><p>${message}</p>`,
        }).then(result => result.success);
    }

    // Update notification status
    await this.notificationService.updateStatus(
      (notification as any)._id.toString(),
      emailSent ? NotificationStatus.SENT : NotificationStatus.FAILED
    );
  }

  private async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    category: NotificationCategory,
    metadata?: any,
    language = 'en'
  ): Promise<void> {
    // Create push notification record
    const notificationDto: CreateNotificationDto = {
      userId,
      title,
      message,
      type: NotificationType.PUSH,
      category,
      metadata,
      language,
    };

    const notification = await this.notificationService.create(notificationDto);

    // Get user device tokens
    const deviceTokens = await this.preferenceService.getUserDeviceTokens(userId);

    if (deviceTokens.length === 0) {
      await this.notificationService.updateStatus(
        (notification as any)._id.toString(),
        NotificationStatus.FAILED
      );
      return;
    }

    // Send push notification based on category
    let result: any;

    switch (category) {
      case NotificationCategory.ORDER:
        result = await this.pushService.sendOrderNotification(
          deviceTokens,
          metadata?.orderData,
          language
        );
        break;
      case NotificationCategory.PROMOTION:
        result = await this.pushService.sendPromotionNotification(
          deviceTokens,
          metadata?.promotionData,
          language
        );
        break;
      default:
        result = await this.pushService.sendToMultipleDevices(
          deviceTokens,
          {
            title,
            body: message,
            data: metadata,
            actionUrl: metadata?.actionUrl,
          },
          language
        );
    }

    // Update notification status
    const success = result.successCount > 0;
    await this.notificationService.updateStatus(
      (notification as any)._id.toString(),
      success ? NotificationStatus.SENT : NotificationStatus.FAILED
    );
  }

  // Event listeners for automatic notifications
  @OnEvent('user.registered')
  async handleUserRegistered(event: { userId: string; userEmail: string; userName: string; language?: string }) {
    await this.sendNotification(
      event.userId,
      NotificationCategory.SYSTEM,
      'Welcome!',
      `Welcome ${event.userName}! Thank you for joining our store.`,
      { userEmail: event.userEmail, actionUrl: '/dashboard' },
      event.language
    );

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      event.userEmail,
      event.userName,
      event.language
    );
  }

  @OnEvent('order.placed')
  async handleOrderPlaced(event: { userId: string; orderData: any; userEmail: string; language?: string }) {
    await this.sendNotification(
      event.userId,
      NotificationCategory.ORDER,
      'Order Confirmed',
      `Your order #${event.orderData.orderNumber} has been confirmed.`,
      { 
        orderData: event.orderData, 
        userEmail: event.userEmail,
        actionUrl: `/orders/${event.orderData.id}` 
      },
      event.language
    );
  }

  @OnEvent('order.status.updated')
  async handleOrderStatusUpdated(event: { userId: string; orderData: any; language?: string }) {
    await this.sendNotification(
      event.userId,
      NotificationCategory.SHIPPING,
      'Order Status Update',
      `Your order #${event.orderData.orderNumber} status has been updated to: ${event.orderData.status}`,
      { 
        orderData: event.orderData,
        actionUrl: `/orders/${event.orderData.id}` 
      },
      event.language
    );
  }

  @OnEvent('payment.confirmed')
  async handlePaymentConfirmed(event: { userId: string; paymentData: any; language?: string }) {
    await this.sendNotification(
      event.userId,
      NotificationCategory.PAYMENT,
      'Payment Confirmed',
      `Your payment of ${event.paymentData.amount} has been confirmed.`,
      { 
        paymentData: event.paymentData,
        actionUrl: `/orders/${event.paymentData.orderId}` 
      },
      event.language
    );
  }

  @OnEvent('inventory.low.stock')
  async handleLowStock(event: { productData: any; userIds: string[]; language?: string }) {
    for (const userId of event.userIds) {
      await this.sendNotification(
        userId,
        NotificationCategory.SYSTEM,
        'Low Stock Alert',
        `${event.productData.name} is running low in stock. Only ${event.productData.stock} left!`,
        { 
          productData: event.productData,
          actionUrl: `/products/${event.productData.id}` 
        },
        event.language
      );
    }
  }

  @OnEvent('promotion.created')
  async handlePromotionCreated(event: { promotionData: any; userIds: string[]; language?: string }) {
    for (const userId of event.userIds) {
      await this.sendNotification(
        userId,
        NotificationCategory.PROMOTION,
        'Special Offer!',
        `Get ${event.promotionData.discount}% off on ${event.promotionData.category}`,
        { 
          promotionData: event.promotionData,
          actionUrl: `/promotions/${event.promotionData.id}` 
        },
        event.language
      );
    }
  }
}
