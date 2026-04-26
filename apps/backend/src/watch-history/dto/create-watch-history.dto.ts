import { IsInt, Min } from 'class-validator';

export class CreateWatchHistoryDto {
  @IsInt()
  @Min(1)
  contentId: number = 0;

  @IsInt()
  @Min(1)
  userId: number = 0;
}
