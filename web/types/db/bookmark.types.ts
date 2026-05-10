export type BookmarkEntityType = "gig" | "job";

export interface Bookmark {
  id: string;
  profile: string;
  entity_type: BookmarkEntityType;
  entity_id: string;
  created_at: string;
}
