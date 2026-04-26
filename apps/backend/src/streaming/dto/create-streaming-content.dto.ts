import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsNumber,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ContentType } from '../entities/streaming-content.entity.js';

export class CreateStreamingContentDto {
  @IsString()
  @MinLength(1)
  title: string = '';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @IsOptional()
  @IsInt()
  @Min(1801)
  @Max(2099)
  year?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genre?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  castMembers?: string[];
}
