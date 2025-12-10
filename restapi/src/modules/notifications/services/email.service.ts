import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotificationStatus } from '../schemas/notification.schema';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'localhost'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'noreply@ecommerce.com'),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendWelcomeEmail(email: string, name: string, language = 'en'): Promise<boolean> {
    const templates = {
      en: {
        subject: 'Welcome to Our Store!',
        html: `
          <h1>Welcome ${name}!</h1>
          <p>Thank you for joining our store. We're excited to have you as a customer.</p>
          <p>Start shopping now and discover amazing products!</p>
        `,
      },
      es: {
        subject: '¡Bienvenido a Nuestra Tienda!',
        html: `
          <h1>¡Bienvenido ${name}!</h1>
          <p>Gracias por unirte a nuestra tienda. Estamos emocionados de tenerte como cliente.</p>
          <p>¡Comienza a comprar ahora y descubre productos increíbles!</p>
        `,
      },
      ar: {
        subject: 'مرحباً بك في متجرنا!',
        html: `
          <h1>مرحباً ${name}!</h1>
          <p>شكراً لانضمامك إلى متجرنا. نحن متحمسون لوجودك كعميل.</p>
          <p>ابدأ التسوق الآن واكتشف منتجات رائعة!</p>
        `,
        direction: 'rtl',
      },
      fr: {
        subject: 'Bienvenue dans notre magasin!',
        html: `
          <h1>Bienvenue ${name}!</h1>
          <p>Merci de rejoindre notre magasin. Nous sommes ravis de vous avoir comme client.</p>
          <p>Commencez vos achats maintenant et découvrez des produits incroyables!</p>
        `,
      },
    };

    const template = templates[language] || templates['en'];
    
    const result = await this.sendEmail({
      to: email,
      subject: template.subject,
      html: `
        <div style="direction: ${template.direction || 'ltr'}; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${template.html}
        </div>
      `,
    });

    return result.success;
  }

  async sendOrderConfirmationEmail(
    email: string, 
    orderData: any, 
    language = 'en'
  ): Promise<boolean> {
    const templates = {
      en: {
        subject: `Order Confirmation #${orderData.orderNumber}`,
        html: `
          <h1>Order Confirmation</h1>
          <p>Thank you for your order! Your order #${orderData.orderNumber} has been confirmed.</p>
          <p><strong>Total: ${orderData.total}</strong></p>
          <p>We'll send you another email when your order ships.</p>
        `,
      },
      es: {
        subject: `Confirmación de Pedido #${orderData.orderNumber}`,
        html: `
          <h1>Confirmación de Pedido</h1>
          <p>¡Gracias por tu pedido! Tu pedido #${orderData.orderNumber} ha sido confirmado.</p>
          <p><strong>Total: ${orderData.total}</strong></p>
          <p>Te enviaremos otro email cuando tu pedido sea enviado.</p>
        `,
      },
      ar: {
        subject: `تأكيد الطلب #${orderData.orderNumber}`,
        html: `
          <h1>تأكيد الطلب</h1>
          <p>شكراً لطلبك! تم تأكيد طلبك #${orderData.orderNumber}.</p>
          <p><strong>المجموع: ${orderData.total}</strong></p>
          <p>سنرسل لك بريد إلكتروني آخر عندما يتم شحن طلبك.</p>
        `,
        direction: 'rtl',
      },
      fr: {
        subject: `Confirmation de commande #${orderData.orderNumber}`,
        html: `
          <h1>Confirmation de commande</h1>
          <p>Merci pour votre commande! Votre commande #${orderData.orderNumber} a été confirmée.</p>
          <p><strong>Total: ${orderData.total}</strong></p>
          <p>Nous vous enverrons un autre email quand votre commande sera expédiée.</p>
        `,
      },
    };

    const template = templates[language] || templates['en'];
    
    const result = await this.sendEmail({
      to: email,
      subject: template.subject,
      html: `
        <div style="direction: ${template.direction || 'ltr'}; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${template.html}
        </div>
      `,
    });

    return result.success;
  }

  async sendPasswordResetEmail(
    email: string, 
    resetToken: string, 
    language = 'en'
  ): Promise<boolean> {
    const baseUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const templates = {
      en: {
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      },
      es: {
        subject: 'Solicitud de Restablecimiento de Contraseña',
        html: `
          <h1>Restablecimiento de Contraseña</h1>
          <p>Solicitaste un restablecimiento de contraseña. Haz clic en el enlace de abajo para restablecer tu contraseña:</p>
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Restablecer Contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste esto, por favor ignora este email.</p>
        `,
      },
      ar: {
        subject: 'طلب إعادة تعيين كلمة المرور',
        html: `
          <h1>إعادة تعيين كلمة المرور</h1>
          <p>طلبت إعادة تعيين كلمة المرور. انقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">إعادة تعيين كلمة المرور</a>
          <p>ستنتهي صلاحية هذا الرابط خلال ساعة واحدة.</p>
          <p>إذا لم تطلب هذا، يرجى تجاهل هذا البريد الإلكتروني.</p>
        `,
        direction: 'rtl',
      },
      fr: {
        subject: 'Demande de réinitialisation de mot de passe',
        html: `
          <h1>Réinitialisation du mot de passe</h1>
          <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Réinitialiser le mot de passe</a>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cela, veuillez ignorer cet email.</p>
        `,
      },
    };

    const template = templates[language] || templates['en'];
    
    const result = await this.sendEmail({
      to: email,
      subject: template.subject,
      html: `
        <div style="direction: ${template.direction || 'ltr'}; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${template.html}
        </div>
      `,
    });

    return result.success;
  }
}
