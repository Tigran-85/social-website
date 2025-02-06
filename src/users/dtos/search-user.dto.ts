import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  age?: number;
}
