export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;

  image_url: string;
  mobile_image_url: string | null;

  image_path: string | null;
  mobile_image_path: string | null;

  button_text: string | null;
  button_link: string | null;

  position: string;

  display_order: number;

  starts_at: string | null;
  ends_at: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}