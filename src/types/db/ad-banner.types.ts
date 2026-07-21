import { SystemFields } from "../generic.types";

export interface AdBannerCore {
  name: string;
  placement: string;
  image_url: string;
  alt_text: string;
  target_url: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface AdBanner extends AdBannerCore, SystemFields {}

export type AdBannerForm = AdBannerCore;
