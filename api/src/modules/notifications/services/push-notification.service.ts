import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface PushNotificationOptions {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
  actionUrl?: string;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT');
      
      if (serviceAccount && !admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(serviceAccount)),
        });
        this.logger.log('Firebase Admin initialized successfully');
      }
    } catch (error) {
      this.logger.warn('Firebase Admin initialization failed:', error.message);
    }
  }

  async sendToDevice(
    deviceToken: string,
    options: PushNotificationOptions,
    language = 'en'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!admin.apps.length) {
        throw new Error('Firebase Admin not initialized');
      }

      const message: admin.messaging.Message = {
        token: deviceToken,
        notification: {
          title: options.title,
          body: options.body,
          imageUrl: options.imageUrl,
        },
        data: {
          ...options.data,
          language,
          actionUrl: options.actionUrl || '',
        },
        android: {
          notification: {
            title: options.title,
            body: options.body,
            imageUrl: options.imageUrl,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            priority: 'high' as any,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: options.title,
                body: options.body,
              },
              badge: 1,
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      
      this.logger.log(`Push notification sent successfully: ${response}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendToMultipleDevices(
    deviceTokens: string[],
    options: PushNotificationOptions,
    language = 'en'
  ): Promise<{ 
    successCount: number; 
    failureCount: number; 
    errors: any[] 
  }> {
    try {
      if (!admin.apps.length) {
        throw new Error('Firebase Admin not initialized');
      }

      const promises = deviceTokens.map(token => 
        this.sendToDevice(token, options, language)
      );

      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failureCount = results.length - successCount;
      const errors = results
        .map((r, idx) => 
          r.status === 'rejected' || !r.value.success 
            ? { index: idx, error: r.status === 'rejected' ? r.reason : r.value.error }
            : null
        )
        .filter(Boolean);
      
      this.logger.log(
        `Push notifications sent. Success: ${successCount}, Failure: ${failureCount}`
      );
      
      return {
        successCount,
        failureCount,
        errors,
      };
    } catch (error) {
      this.logger.error(`Failed to send push notifications: ${error.message}`, error.stack);
      
      return {
        successCount: 0,
        failureCount: deviceTokens.length,
        errors: [{ error: error.message }],
      };
    }
  }

  async sendOrderNotification(
    deviceTokens: string[],
    orderData: any,
    language = 'en'
  ): Promise<any> {
    const templates = {
      en: {
        title: 'Order Update',
        body: `Your order #${orderData.orderNumber} status: ${orderData.status}`,
      },
      es: {
        title: 'Actualización de Pedido',
        body: `Tu pedido #${orderData.orderNumber} estado: ${orderData.status}`,
      },
      ar: {
        title: 'تحديث الطلب',
        body: `حالة طلبك #${orderData.orderNumber}: ${orderData.status}`,
      },
      fr: {
        title: 'Mise à jour de commande',
        body: `Votre commande #${orderData.orderNumber} statut: ${orderData.status}`,
      },
    };

    const template = templates[language] || templates['en'];

    return this.sendToMultipleDevices(deviceTokens, {
      title: template.title,
      body: template.body,
      data: {
        type: 'order_update',
        orderId: orderData.id,
        orderNumber: orderData.orderNumber,
      },
      actionUrl: `/orders/${orderData.id}`,
    }, language);
  }

  async sendPromotionNotification(
    deviceTokens: string[],
    promotionData: any,
    language = 'en'
  ): Promise<any> {
    const templates = {
      en: {
        title: 'Special Offer!',
        body: `${promotionData.discount}% off on ${promotionData.category}`,
      },
      es: {
        title: '¡Oferta Especial!',
        body: `${promotionData.discount}% de descuento en ${promotionData.category}`,
      },
      ar: {
        title: 'عرض خاص!',
        body: `خصم ${promotionData.discount}% على ${promotionData.category}`,
      },
      fr: {
        title: 'Offre spéciale!',
        body: `${promotionData.discount}% de réduction sur ${promotionData.category}`,
      },
    };

    const template = templates[language] || templates['en'];

    return this.sendToMultipleDevices(deviceTokens, {
      title: template.title,
      body: template.body,
      data: {
        type: 'promotion',
        promotionId: promotionData.id,
        category: promotionData.category,
      },
      imageUrl: promotionData.imageUrl,
      actionUrl: `/promotions/${promotionData.id}`,
    }, language);
  }

  async sendLowStockAlert(
    deviceTokens: string[],
    productData: any,
    language = 'en'
  ): Promise<any> {
    const templates = {
      en: {
        title: 'Low Stock Alert',
        body: `${productData.name} is running low. Only ${productData.stock} left!`,
      },
      es: {
        title: 'Alerta de Stock Bajo',
        body: `${productData.name} se está agotando. ¡Solo quedan ${productData.stock}!`,
      },
      ar: {
        title: 'تنبيه مخزون منخفض',
        body: `${productData.name} ينفد. فقط ${productData.stock} متبقي!`,
      },
      fr: {
        title: 'Alerte stock faible',
        body: `${productData.name} est en rupture de stock. Il ne reste que ${productData.stock}!`,
      },
    };

    const template = templates[language] || templates['en'];

    return this.sendToMultipleDevices(deviceTokens, {
      title: template.title,
      body: template.body,
      data: {
        type: 'low_stock',
        productId: productData.id,
      },
      imageUrl: productData.imageUrl,
      actionUrl: `/products/${productData.id}`,
    }, language);
  }
}
