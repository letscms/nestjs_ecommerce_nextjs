import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from '../../i18n/i18n.module';

// Schemas
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationPreference, NotificationPreferenceSchema } from './schemas/notification-preference.schema';
import { NotificationTemplate, NotificationTemplateSchema } from './schemas/notification-template.schema';

// Services
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { EmailService } from './services/email.service';
import { PushNotificationService } from './services/push-notification.service';
import { NotificationOrchestratorService } from './services/notification-orchestrator.service';

// Controllers
import { NotificationController } from './controllers/notification.controller';
import { NotificationPreferenceController } from './controllers/notification-preference.controller';

// Response Service
import { ResponseService } from '../../i18n/services/response.service';

@Module({
  imports: [
    ConfigModule,
    I18nModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationPreference.name, schema: NotificationPreferenceSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
    ]),
  ],
  controllers: [
    NotificationController,
    NotificationPreferenceController,
  ],
  providers: [
    NotificationService,
    NotificationPreferenceService,
    EmailService,
    PushNotificationService,
    NotificationOrchestratorService,
    ResponseService,
  ],
  exports: [
    NotificationService,
    NotificationPreferenceService,
    EmailService,
    PushNotificationService,
    NotificationOrchestratorService,
  ],
})
export class NotificationsModule {}
