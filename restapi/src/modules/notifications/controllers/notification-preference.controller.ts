import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { UpdateNotificationPreferenceDto, AddDeviceTokenDto } from '../dto/notification-preference.dto';
import { ResponseService } from '../../../i18n/services/response.service';
import { I18nLang } from 'nestjs-i18n';

@ApiTags('notification-preferences')
@Controller('notification-preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationPreferenceController {
  constructor(
    private readonly preferenceService: NotificationPreferenceService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(
    @Request() req,
    @I18nLang() lang: string = 'en',
  ) {
    const preferences = await this.preferenceService.findByUserId(req.user.id);
    return this.responseService.success(
      preferences,
      'common.success',
      lang
    );
  }

  @Patch()
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(
    @Request() req,
    @Body() updateDto: UpdateNotificationPreferenceDto,
    @I18nLang() lang: string = 'en',
  ) {
    const preferences = await this.preferenceService.createOrUpdate(
      req.user.id,
      updateDto
    );
    
    return this.responseService.success(
      preferences,
      'common.updated',
      lang
    );
  }

  @Patch('device-token')
  @ApiOperation({ summary: 'Add device token for push notifications' })
  async addDeviceToken(
    @Request() req,
    @Body() addTokenDto: AddDeviceTokenDto,
    @I18nLang() lang: string = 'en',
  ) {
    const preferences = await this.preferenceService.addDeviceToken(
      req.user.id,
      addTokenDto.deviceToken
    );
    
    return this.responseService.success(
      preferences,
      'notifications.device_token_added',
      lang
    );
  }

  @Patch('category/:category/:enabled')
  @ApiOperation({ summary: 'Update category preference' })
  async updateCategoryPreference(
    @Request() req,
    @Body('category') category: string,
    @Body('enabled') enabled: boolean,
    @I18nLang() lang: string = 'en',
  ) {
    const preferences = await this.preferenceService.updateCategoryPreference(
      req.user.id,
      category,
      enabled
    );
    
    return this.responseService.success(
      preferences,
      'notifications.category_preference_updated',
      lang
    );
  }
}
