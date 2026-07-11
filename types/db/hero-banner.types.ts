import { SystemFields } from "../generic.types";

export interface HeroBannerCore {
  title: string;
  subtitle: string | null;
  image_url: string;
  alt_text: string;
  button_text: string | null;
  button_url: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface HeroBanner extends HeroBannerCore, SystemFields {}

export type HeroBannerForm = HeroBannerCore;
