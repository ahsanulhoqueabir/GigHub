export interface UploadResult {
  url: string;
  key: string;
}

export type UploadFolder = 'avatars' | 'gigs' | 'deliveries' | 'chat' | 'documents' | 'misc';

export interface DeleteUploadPayload {
  key: string;
}
