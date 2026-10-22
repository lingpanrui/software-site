import { IsBoolean, IsOptional } from 'class-validator';

export class UserListDto {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export class UpdateUserListDto {
  @IsOptional()
  @IsBoolean({ message: 'blacklisted 必须是布尔值' })
  blacklisted?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'whitelisted 必须是布尔值' })
  whitelisted?: boolean;
}
