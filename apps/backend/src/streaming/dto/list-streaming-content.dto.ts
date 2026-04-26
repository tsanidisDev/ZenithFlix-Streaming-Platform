import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType } from '../entities/streaming-content.entity.js';

export class ListStreamingContentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @IsOptional()
  @IsString()
  genre?: string;
}
