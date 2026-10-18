import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SoftwareModule } from './modules/software/software.module';
import { UploadModule } from './modules/upload/upload.module';
import { SiteSettingsModule } from './modules/site-settings/site-settings.module';
import { SeedService } from './common/seed/seed.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SoftwareModule,
    UploadModule,
    SiteSettingsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
