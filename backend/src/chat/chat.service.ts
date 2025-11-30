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
    return this.globalChatRoomId!;
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

    // Проверка на блокировку
    const isBlocked = await this.isUserBlocked(senderId, room.participants.map(p => p.characterId));
    if (isBlocked) {
      throw new BadRequestException('You are blocked by one or more participants');
    }

    // Проверка спам-защиты
    await this.checkSpamProtection(senderId, roomId);

    // Извлечь упоминания (@username)
    const mentionedIds = this.extractMentions(content);

    // Проверить, является ли это командой
    const isCommand = content.startsWith('/');

    // Установить автоудаление через 48 часов
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const message = await this.prisma.chatMessage.create({
      data: {
        senderId,
        roomId,
        content,
        mentionedIds: mentionedIds.length > 0 ? mentionedIds : undefined,
        isCommand,
        expiresAt,
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });

    // Обновить счетчики непрочитанных для участников (кроме отправителя)
    await this.incrementUnreadCount(roomId, senderId);

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

  // ========== НОВЫЕ МЕТОДЫ ==========

  // Создать командный чат
  async createPartyChat(creatorId: number, partyId: string, name: string): Promise<string> {
    const partyRoom = await this.prisma.chatRoom.create({
      data: {
        type: ChatRoomType.PARTY,
        partyId,
        name,
        participants: {
          create: [{ characterId: creatorId }],
        },
      },
    });

    return partyRoom.id;
  }

  // Добавить участника в командный чат
  async addPartyMember(roomId: string, characterId: number): Promise<void> {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room || room.type !== ChatRoomType.PARTY) {
      throw new NotFoundException('Party chat not found');
    }

    await this.prisma.chatParticipant.create({
      data: {
        roomId,
        characterId,
      },
    });
  }

  // Удалить участника из командного чата
  async removePartyMember(roomId: string, characterId: number): Promise<void> {
    await this.prisma.chatParticipant.deleteMany({
      where: {
        roomId,
        characterId,
      },
    });
  }

  // Заблокировать пользователя
  async blockUser(blockerId: number, blockedId: number, reason?: string): Promise<void> {
    // Проверить, не заблокирован ли уже
    const existing = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('User already blocked');
    }

    await this.prisma.blockedUser.create({
      data: {
        blockerId,
        blockedId,
        reason,
      },
    });
  }

  // Разблокировать пользователя
  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await this.prisma.blockedUser.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });
  }

  // Получить список заблокированных пользователей
  async getBlockedUsers(characterId: number): Promise<number[]> {
    const blocked = await this.prisma.blockedUser.findMany({
      where: { blockerId: characterId },
      select: { blockedId: true },
    });

    return blocked.map((b) => b.blockedId);
  }

  // Отметить сообщения как прочитанные
  async markAsRead(roomId: string, characterId: number): Promise<void> {
    await this.prisma.chatParticipant.updateMany({
      where: {
        roomId,
        characterId,
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });
  }

  // Получить непрочитанные сообщения
  async getUnreadCount(roomId: string, characterId: number): Promise<number> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        roomId_characterId: {
          roomId,
          characterId,
        },
      },
    });

    return participant?.unreadCount || 0;
  }

  // Поиск онлайн игроков по имени
  async searchOnlinePlayers(query: string): Promise<Array<{ id: number; name: string }>> {
    const players = await this.prisma.character.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
        isOnline: true,
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });

    return players;
  }

  // Обновить статус онлайн
  async updateOnlineStatus(characterId: number, isOnline: boolean): Promise<void> {
    await this.prisma.character.update({
      where: { id: characterId },
      data: {
        isOnline,
        lastSeenAt: new Date(),
      },
    });
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

  // Извлечь упоминания из текста (@username)
  private extractMentions(content: string): number[] {
    // Простая реализация - можно улучшить
    // Формат: @username или @"username with spaces"
    const mentionPattern = /@(\w+|"[^"]+")/g;
    const matches = content.match(mentionPattern);

    // TODO: Преобразовать имена в ID через запрос к БД
    // Пока возвращаем пустой массив
    return [];
  }

  // Проверить, заблокирован ли пользователь
  private async isUserBlocked(senderId: number, participantIds: number[]): Promise<boolean> {
    const blocked = await this.prisma.blockedUser.findFirst({
      where: {
        blockedId: senderId,
        blockerId: {
          in: participantIds,
        },
      },
    });

    return !!blocked;
  }

  // Проверка спам-защиты (не более 5 сообщений в минуту)
  private async checkSpamProtection(characterId: number, roomId: string): Promise<void> {
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    const log = await this.prisma.chatMessageLog.findUnique({
      where: {
        characterId_roomId: {
          characterId,
          roomId,
        },
      },
    });

    if (log && log.lastMessageAt > oneMinuteAgo) {
      if (log.messageCount >= 5) {
        throw new BadRequestException('Too many messages. Please slow down.');
      }

      // Обновить счетчик
      await this.prisma.chatMessageLog.update({
        where: { id: log.id },
        data: {
          messageCount: log.messageCount + 1,
          lastMessageAt: new Date(),
        },
      });
    } else {
      // Создать или сбросить лог
      await this.prisma.chatMessageLog.upsert({
        where: {
          characterId_roomId: {
            characterId,
            roomId,
          },
        },
        update: {
          messageCount: 1,
          lastMessageAt: new Date(),
        },
        create: {
          characterId,
          roomId,
          messageCount: 1,
          lastMessageAt: new Date(),
        },
      });
    }
  }

  // Увеличить счетчик непрочитанных
  private async incrementUnreadCount(roomId: string, excludeCharacterId: number): Promise<void> {
    await this.prisma.chatParticipant.updateMany({
      where: {
        roomId,
        characterId: {
          not: excludeCharacterId,
        },
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    });
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
