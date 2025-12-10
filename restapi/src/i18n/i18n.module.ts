import { Module } from '@nestjs/common';
import { I18nModule as NestI18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import { join } from 'path';
import { ResponseService } from './services/response.service';

@Module({
  imports: [
    NestI18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(process.cwd(), 'src/i18n/translations'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: HeaderResolver, options: ['accept-language'] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  providers: [ResponseService],
  exports: [NestI18nModule, ResponseService],
})
export class I18nModule {}
