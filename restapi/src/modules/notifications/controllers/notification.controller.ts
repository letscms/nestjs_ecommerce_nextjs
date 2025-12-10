import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';
import { NotificationOrchestratorService } from '../services/notification-orchestrator.service';
import { CreateNotificationDto, UpdateNotificationDto } from '../dto/notification.dto';
import { ResponseService } from '../../../i18n/services/response.service';
import { I18nLang } from 'nestjs-i18n';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly orchestratorService: NotificationOrchestratorService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @I18nLang() lang: string = 'en',
  ) {
    const notification = await this.notificationService.create(createNotificationDto);
    return this.responseService.success(
      notification,
      'notifications.created',
      lang
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async findAll(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('isRead') isRead?: string,
    @I18nLang() lang: string = 'en',
  ) {
    const isReadBool = isRead !== undefined ? isRead === 'true' : undefined;
    const result = await this.notificationService.findByUserId(
      req.user.id,
      +page,
      +limit,
      isReadBool
    );
    
    return this.responseService.success(
      result.notifications,
      'common.success',
      lang,
      {
        page: +page,
        limit: +limit,
        total: result.total,
        totalPages: result.totalPages,
        unreadCount: result.unreadCount,
      }
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  async getUnreadCount(
    @Request() req,
    @I18nLang() lang: string = 'en',
  ) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return this.responseService.success(
      { count },
      'common.success',
      lang
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification' })
  async findOne(
    @Param('id') id: string,
    @I18nLang() lang: string = 'en',
  ) {
    const notification = await this.notificationService.findOne(id);
    if (!notification) {
      return this.responseService.error('common.not_found', null, lang);
    }
    
    return this.responseService.success(
      notification,
      'common.success',
      lang
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @I18nLang() lang: string = 'en',
  ) {
    const notification = await this.notificationService.update(id, updateNotificationDto);
    if (!notification) {
      return this.responseService.error('common.not_found', null, lang);
    }
    
    return this.responseService.success(
      notification,
      'common.updated',
      lang
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @I18nLang() lang: string = 'en',
  ) {
    const notification = await this.notificationService.markAsRead(id);
    if (!notification) {
      return this.responseService.error('common.not_found', null, lang);
    }
    
    return this.responseService.success(
      notification,
      'notifications.marked_as_read',
      lang
    );
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @Request() req,
    @I18nLang() lang: string = 'en',
  ) {
    await this.notificationService.markAllAsRead(req.user.id);
    return this.responseService.success(
      null,
      'notifications.all_marked_as_read',
      lang
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(
    @Param('id') id: string,
    @I18nLang() lang: string = 'en',
  ) {
    await this.notificationService.delete(id);
    return this.responseService.success(
      null,
      'common.deleted',
      lang
    );
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple notifications' })
  async bulkDelete(
    @Request() req,
    @Body('ids') ids: string[],
    @I18nLang() lang: string = 'en',
  ) {
    await this.notificationService.deleteMany(req.user.id, ids);
    return this.responseService.success(
      null,
      'notifications.bulk_deleted',
      lang
    );
  }
}
