export interface SystemConfigCore {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  platform_fee_percent: number;
  max_gig_images: number;
  max_portfolio_images: number;
  max_upload_size_mb: number;
  support_email: string | null;
  support_phone: string | null;
}

export interface SystemConfig extends SystemConfigCore {
  id: boolean;
  created_at: string;
  updated_at: string;
}

export type SystemConfigForm = SystemConfigCore;
