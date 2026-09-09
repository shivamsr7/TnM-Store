export type CollaborationType =
  | "gifted"
  | "affiliate"
  | "paid"
  | "ugc";

export interface CollaboratorApplicationData {
  full_name: string;
  email: string;
  phone: string;

  instagram_username: string;
  instagram_url: string;

  youtube_url: string;
  other_social_url: string;

  follower_count: number | null;
  average_reel_views: number | null;

  content_category: string;
  collaboration_type: CollaborationType;

  why_collaborate: string;
  portfolio_url: string;
}