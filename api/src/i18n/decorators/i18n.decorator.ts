import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

export const GetI18n = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const i18n = I18nContext.current();
    return i18n;
  },
);

export const Translate = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const i18n = I18nContext.current();
    return i18n?.translate(key);
  },
);
