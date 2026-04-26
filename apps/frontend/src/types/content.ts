export interface StreamingContent {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  genre: string;
  content_type: 'movie' | 'series' | 'live';
  release_year: number;
  rating: string | number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse {
  data: StreamingContent[];
  total: number;
  page: number;
  limit: number;
}
