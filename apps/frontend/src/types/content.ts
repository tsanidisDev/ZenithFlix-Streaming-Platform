export interface StreamingContent {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  contentType: 'movie' | 'series' | 'live' | null;
  year: number | null;
  genre: string[] | null;
  rating: string | number | null;
  duration: number | null;
  castMembers: string[] | null;
  watchProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  data: StreamingContent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
