import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'allowlistOnly 必须是布尔值' })
  allowlistOnly?: boolean;
}
