import { PublicProfile } from './profile.types';

export interface ChatRoomRecord {
  id: string;
  order: string;
  buyer: string;
  seller: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  id: string;
  room: string;
  sender: string;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
}

export interface ChatRoomOrderInfo {
  id: string;
  status: string;
  code: string;
  title: string;
  total_price: number;
  deadline: string | null;
  source: 'gig' | 'job';
}

export interface PopulatedChatRoom extends Omit<ChatRoomRecord, 'order' | 'buyer' | 'seller'> {
  order: ChatRoomOrderInfo;
  buyer: PublicProfile;
  seller: PublicProfile;
  lastMessage?: ChatMessageRecord | null;
}

export interface PopulatedChatMessage extends Omit<ChatMessageRecord, 'sender'> {
  sender: PublicProfile;
}
