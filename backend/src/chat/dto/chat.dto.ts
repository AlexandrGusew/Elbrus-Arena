import { ChatRoomType } from '@prisma/client';

export class SendMessageDto {
  content: string;
  roomId?: string; // Для приватных чатов и чата боя
}

export class CreatePrivateChatDto {
  receiverId: number;
}

export class JoinGlobalChatDto {
  characterId: number;
}

export class GetMessagesDto {
  roomId: string;
  limit?: number;
  offset?: number;
}

export class InviteToPrivateChatDto {
  receiverId: number;
}

export class RespondToInvitationDto {
  invitationId: number;
  accept: boolean; // true = accept, false = reject
}

export interface ChatMessageResponse {
  id: number;
  roomId: string;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: Date;
}

export interface ChatRoomResponse {
  id: string;
  type: ChatRoomType;
  participants: Array<{
    characterId: number;
    characterName: string;
  }>;
  lastMessage?: ChatMessageResponse;
}

export interface ChatInvitationResponse {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  status: string;
  createdAt: Date;
}
