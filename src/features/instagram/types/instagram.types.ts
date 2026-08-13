export interface InstagramReel {
  id: string;

  caption: string;

  mediaType: string;

  mediaProductType: string;

  mediaUrl: string | null;

  thumbnailUrl: string | null;

  permalink: string | null;

  timestamp: string | null;

  username: string;
}


export interface InstagramReelsResponse {
  success: boolean;

  reels: InstagramReel[];

  count: number;

  error?: string;
}