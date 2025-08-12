import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationPreference, NotificationPreferenceDocument } from '../schemas/notification-preference.schema';
import { UpdateNotificationPreferenceDto } from '../dto/notification-preference.dto';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectModel(NotificationPreference.name)
    private preferenceModel: Model<NotificationPreferenceDocument>,
  ) {}

  async createOrUpdate(
    userId: string,
    updateDto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreference> {
    return this.preferenceModel
      .findOneAndUpdate(
        { userId },
        { ...updateDto, userId },
        { new: true, upsert: true }
      )
      .lean();
  }

  async findByUserId(userId: string): Promise<NotificationPreference | null> {
    return this.preferenceModel.findOne({ userId }).lean();
  }

  async addDeviceToken(userId: string, deviceToken: string): Promise<NotificationPreference | null> {
    return this.preferenceModel
      .findOneAndUpdate(
        { userId },
        { $addToSet: { deviceTokens: deviceToken } },
        { new: true, upsert: true }
      )
      .lean();
  }

  async removeDeviceToken(userId: string, deviceToken: string): Promise<NotificationPreference | null> {
    return this.preferenceModel
      .findOneAndUpdate(
        { userId },
        { $pull: { deviceTokens: deviceToken } },
        { new: true }
      )
      .lean();
  }

  async updateCategoryPreference(
    userId: string,
    category: string,
    enabled: boolean
  ): Promise<NotificationPreference | null> {
    return this.preferenceModel
      .findOneAndUpdate(
        { userId },
        { 
          $set: { 
            [`categoryPreferences.${category}`]: enabled 
          } 
        },
        { new: true, upsert: true }
      )
      .lean();
  }

  async isNotificationEnabled(
    userId: string,
    type: 'email' | 'push' | 'sms' | 'in_app',
    category?: string
  ): Promise<boolean> {
    const preference = await this.findByUserId(userId);
    
    if (!preference) {
      return true; // Default to enabled if no preferences set
    }

    // Check type preference
    let typeEnabled = true;
    switch (type) {
      case 'email':
        typeEnabled = preference.emailNotifications;
        break;
      case 'push':
        typeEnabled = preference.pushNotifications;
        break;
      case 'sms':
        typeEnabled = preference.smsNotifications;
        break;
      case 'in_app':
        typeEnabled = preference.inAppNotifications;
        break;
    }

    if (!typeEnabled) {
      return false;
    }

    // Check category preference if provided
    if (category && preference.categoryPreferences) {
      return preference.categoryPreferences[category] !== false;
    }

    return true;
  }

  async getUserDeviceTokens(userId: string): Promise<string[]> {
    const preference = await this.findByUserId(userId);
    return preference?.deviceTokens || [];
  }

  async getUserLanguage(userId: string): Promise<string> {
    const preference = await this.findByUserId(userId);
    return preference?.preferredLanguage || 'en';
  }
}
