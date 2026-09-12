export type ReviewMediaType = "image" | "video";

export interface ReviewMedia {
  id: string;
  review_id: string;
  media_type: ReviewMediaType;
  media_url: string;
  storage_path: string | null;
  thumbnail_url: string | null;
  sort_order: number;
  created_at: string;
}