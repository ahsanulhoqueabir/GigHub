import { SystemFields } from "../generic.types";

export interface AnnouncementCore {
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  send_push: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface Announcement extends AnnouncementCore, SystemFields {}

export type AnnouncementForm = AnnouncementCore;
