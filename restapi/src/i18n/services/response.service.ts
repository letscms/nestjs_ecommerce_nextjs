import { Injectable, Optional } from '@nestjs/common';
import { I18nService, I18nContext } from 'nestjs-i18n';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class ResponseService {
  constructor(@Optional() private readonly i18n?: I18nService) {}

  success<T>(
    data?: T,
    messageKey?: string,
    lang?: string,
    meta?: any
  ): ApiResponse<T> {
    let message: string | undefined;
    
    if (messageKey) {
      if (this.i18n) {
        message = this.i18n.translate(messageKey, { lang });
      } else {
        // Fallback to I18nContext if service is not available
        const i18nContext = I18nContext.current();
        message = i18nContext ? i18nContext.translate(messageKey) : messageKey;
      }
    }

    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  error(
    messageKey: string,
    errors?: any,
    lang?: string
  ): ApiResponse {
    let message: string;
    
    if (this.i18n) {
      message = this.i18n.translate(messageKey, { lang });
    } else {
      // Fallback to I18nContext if service is not available
      const i18nContext = I18nContext.current();
      message = i18nContext ? i18nContext.translate(messageKey) : messageKey;
    }

    return {
      success: false,
      message,
      errors,
    };
  }

  validationError(
    errors: any,
    lang?: string
  ): ApiResponse {
    let message: string;
    
    if (this.i18n) {
      message = this.i18n.translate('common.validation_failed', { lang });
    } else {
      // Fallback to I18nContext if service is not available
      const i18nContext = I18nContext.current();
      message = i18nContext ? i18nContext.translate('common.validation_failed') : 'Validation failed';
    }

    return {
      success: false,
      message,
      errors,
    };
  }
}
