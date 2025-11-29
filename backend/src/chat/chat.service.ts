import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatRoomType } from '@prisma/client';
import {
  ChatMessageResponse,
  ChatRoomResponse,
  ChatInvitationResponse,
} from './dto/chat.dto';

@Injectable()
export class ChatService {
  private globalChatRoomId: string | null = null;

  constructor(private prisma: PrismaService) {
    this.initGlobalChat();
  }

  // Инициализация глобального чата при запуске
  private async initGlobalChat() {
    const globalRoom = await this.prisma.chatRoom.findFirst({
      where: { type: ChatRoomType.GLOBAL },
    });

    if (!globalRoom) {
      const newGlobalRoom = await this.prisma.chatRoom.create({
        data: { type: ChatRoomType.GLOBAL },
      });
      this.globalChatRoomId = newGlobalRoom.id;
    } else {
      this.globalChatRoomId = globalRoom.id;
    }
  }

  async getGlobalChatRoomId(): Promise<string> {
    if (!this.globalChatRoomId) {
      await this.initGlobalChat();
    }
    return this.globalChatRoomId;
  }

  // Отправить сообщение в чат
  async sendMessage(
    senderId: number,
    roomId: string,
    content: string,
  ): Promise<ChatMessageResponse> {
    // Проверить, что отправитель является участником комнаты (кроме глобального чата)
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    if (room.type !== ChatRoomType.GLOBAL) {
      const isParticipant = room.participants.some(
        (p) => p.characterId === senderId,
      );
      if (!isParticipant) {
        throw new BadRequestException('You are not a participant of this chat');
      }
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        senderId,
        roomId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: message.sender.name,
      content: message.content,
      createdAt: message.createdAt,
    };
  }

  // Получить историю сообщений
  async getMessages(
    roomId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ChatMessageResponse[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { roomId },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return messages.map((msg) => ({
      id: msg.id,
      roomId: msg.roomId,
      senderId: msg.senderId,
      senderName: msg.sender.name,
      content: msg.content,
      createdAt: msg.createdAt,
    })).reverse(); // Реверс для хронологического порядка
  }

  // Создать приватный чат
  async createPrivateChat(
    senderId: number,
    receiverId: number,
  ): Promise<ChatRoomResponse> {
    // Проверить, существует ли уже приватный чат между этими игроками
    const existingChat = await this.prisma.chatRoom.findFirst({
      where: {
        type: ChatRoomType.PRIVATE,
        participants: {
          every: {
            OR: [
              { characterId: senderId },
              { characterId: receiverId },
            ],
          },
        },
      },
      include: {
        participants: {
          include: {
            character: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (existingChat) {
      return this.formatChatRoom(existingChat);
    }

    // Создать новый приватный чат
    const newRoom = await this.prisma.chatRoom.create({
      data: {
        type: ChatRoomType.PRIVATE,
        participants: {
          create: [
            { characterId: senderId },
            { characterId: receiverId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            character: { select: { id: true, name: true } },
          },
        },
      },
    });

    return this.formatChatRoom(newRoom);
  }

  // Создать чат боя для PvP
  async createBattleChat(battleId: string, player1Id: number, player2Id: number): Promise<string> {
    const battleRoom = await this.prisma.chatRoom.create({
      data: {
        type: ChatRoomType.BATTLE,
        battleId,
        participants: {
          create: [
            { characterId: player1Id },
            { characterId: player2Id },
          ],
        },
      },
    });

    return battleRoom.id;
  }

  // Получить список чатов пользователя
  async getUserChats(characterId: number): Promise<ChatRoomResponse[]> {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          { type: ChatRoomType.GLOBAL },
          {
            participants: {
              some: { characterId },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            character: { select: { id: true, name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
    });

    return rooms.map((room) => this.formatChatRoom(room));
  }

  // Отправить приглашение в приватный чат
  async sendInvitation(senderId: number, receiverId: number): Promise<ChatInvitationResponse> {
    // Проверить, нет ли уже активного приглашения
    const existingInvitation = await this.prisma.chatInvitation.findFirst({
      where: {
        senderId,
        receiverId,
        status: 'pending',
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('Invitation already sent');
    }

    const invitation = await this.prisma.chatInvitation.create({
      data: {
        senderId,
        receiverId,
        status: 'pending',
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    return {
      id: invitation.id,
      senderId: invitation.senderId,
      senderName: invitation.sender.name,
      receiverId: invitation.receiverId,
      receiverName: invitation.receiver.name,
      status: invitation.status,
      createdAt: invitation.createdAt,
    };
  }

  // Ответить на приглашение
  async respondToInvitation(
    invitationId: number,
    accept: boolean,
  ): Promise<ChatRoomResponse | null> {
    const invitation = await this.prisma.chatInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation already processed');
    }

    // Обновить статус приглашения
    await this.prisma.chatInvitation.update({
      where: { id: invitationId },
      data: { status: accept ? 'accepted' : 'rejected' },
    });

    if (accept) {
      // Создать приватный чат
      return await this.createPrivateChat(
        invitation.senderId,
        invitation.receiverId,
      );
    }

    return null;
  }

  // Получить входящие приглашения
  async getInvitations(characterId: number): Promise<ChatInvitationResponse[]> {
    const invitations = await this.prisma.chatInvitation.findMany({
      where: {
        receiverId: characterId,
        status: 'pending',
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      senderId: inv.senderId,
      senderName: inv.sender.name,
      receiverId: inv.receiverId,
      receiverName: inv.receiver.name,
      status: inv.status,
      createdAt: inv.createdAt,
    }));
  }

  // Вспомогательный метод для форматирования ChatRoom
  private formatChatRoom(room: any): ChatRoomResponse {
    return {
      id: room.id,
      type: room.type,
      participants: room.participants.map((p: any) => ({
        characterId: p.character.id,
        characterName: p.character.name,
      })),
      lastMessage: room.messages?.[0]
        ? {
            id: room.messages[0].id,
            roomId: room.messages[0].roomId,
            senderId: room.messages[0].senderId,
            senderName: room.messages[0].sender.name,
            content: room.messages[0].content,
            createdAt: room.messages[0].createdAt,
          }
        : undefined,
    };
  }
}
