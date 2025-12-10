import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationStatus } from '../schemas/notification.schema';
import { CreateNotificationDto, UpdateNotificationDto } from '../dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }

  async findAll(filters: any = {}, page = 1, limit = 20): Promise<{
    notifications: Notification[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      this.notificationModel.countDocuments(filters),
    ]);

    return {
      notifications,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(
    userId: string, 
    page = 1, 
    limit = 20,
    isRead?: boolean
  ): Promise<{
    notifications: Notification[];
    total: number;
    totalPages: number;
    unreadCount: number;
  }> {
    const skip = (page - 1) * limit;
    const filters: any = { userId };
    
    if (isRead !== undefined) {
      filters.isRead = isRead;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments(filters),
      this.notificationModel.countDocuments({ userId, isRead: false }),
    ]);

    return {
      notifications,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async findOne(id: string): Promise<Notification | null> {
    return this.notificationModel.findById(id).populate('userId', 'name email').lean();
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .lean();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(
        id,
        { 
          isRead: true, 
          readAt: new Date(),
          status: NotificationStatus.READ 
        },
        { new: true }
      )
      .lean();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date(),
        status: NotificationStatus.READ 
      }
    );
  }

  async updateStatus(id: string, status: NotificationStatus): Promise<Notification | null> {
    const updateData: any = { status };
    
    if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
    }

    return this.notificationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean();
  }

  async delete(id: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(id);
  }

  async deleteMany(userId: string, ids: string[]): Promise<void> {
    await this.notificationModel.deleteMany({
      _id: { $in: ids },
      userId,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId,
      isRead: false,
    });
  }

  async cleanup(olderThanDays = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });
  }
}
