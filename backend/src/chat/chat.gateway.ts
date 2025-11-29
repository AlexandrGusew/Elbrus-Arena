import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import {
  SendMessageDto,
  GetMessagesDto,
  InviteToPrivateChatDto,
  RespondToInvitationDto,
} from './dto/chat.dto';

const corsOriginsString = process.env.CORS_ORIGINS || '';
const corsOrigins = corsOriginsString.split(',').filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:5173'],
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);
  private socketToCharacter: Map<string, number> = new Map(); // socketId -> characterId
  private characterToSocket: Map<number, string> = new Map(); // characterId -> socketId

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const characterId = this.socketToCharacter.get(client.id);
    if (characterId) {
      this.characterToSocket.delete(characterId);
      this.socketToCharacter.delete(client.id);
      this.logger.log(`Character ${characterId} disconnected`);
    }
  }

  // Присоединиться к глобальному чату
  @SubscribeMessage('join_global_chat')
  async handleJoinGlobalChat(
    @MessageBody() data: { characterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId } = data;

    try {
      // Сохранить связь socket -> character
      this.socketToCharacter.set(client.id, characterId);
      this.characterToSocket.set(characterId, client.id);

      const globalRoomId = await this.chatService.getGlobalChatRoomId();

      // Присоединить сокет к комнате
      await client.join(globalRoomId);

      // Получить последние сообщения
      const messages = await this.chatService.getMessages(globalRoomId, 50);

      client.emit('joined_global_chat', {
        roomId: globalRoomId,
        messages,
      });

      this.logger.log(`Character ${characterId} joined global chat`);
    } catch (error) {
      this.logger.error(`Error joining global chat: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Присоединиться к приватному чату или чату боя
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { characterId: number; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId, roomId } = data;

    try {
      // Сохранить связь socket -> character
      this.socketToCharacter.set(client.id, characterId);
      this.characterToSocket.set(characterId, client.id);

      // Присоединить сокет к комнате
      await client.join(roomId);

      // Получить последние сообщения
      const messages = await this.chatService.getMessages(roomId, 50);

      client.emit('joined_room', {
        roomId,
        messages,
      });

      this.logger.log(`Character ${characterId} joined room ${roomId}`);
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Покинуть комнату
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(data.roomId);
    this.logger.log(`Client ${client.id} left room ${data.roomId}`);
  }

  // Отправить сообщение
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto & { characterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId, content, roomId } = data;

    try {
      let targetRoomId = roomId;

      // Если roomId не указан, используем глобальный чат
      if (!targetRoomId) {
        targetRoomId = await this.chatService.getGlobalChatRoomId();
      }

      // Сохранить сообщение в БД
      const message = await this.chatService.sendMessage(
        characterId,
        targetRoomId,
        content,
      );

      // Отправить сообщение всем в комнате
      this.server.to(targetRoomId).emit('new_message', message);

      this.logger.log(
        `Message from ${characterId} in room ${targetRoomId}: ${content}`,
      );
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Получить историю сообщений
  @SubscribeMessage('get_messages')
  async handleGetMessages(
    @MessageBody() data: GetMessagesDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messages = await this.chatService.getMessages(
        data.roomId,
        data.limit,
        data.offset,
      );

      client.emit('messages_history', { roomId: data.roomId, messages });
    } catch (error) {
      this.logger.error(`Error getting messages: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Пригласить в приватный чат
  @SubscribeMessage('invite_to_private_chat')
  async handleInviteToPrivateChat(
    @MessageBody() data: InviteToPrivateChatDto & { senderId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { senderId, receiverId } = data;

    try {
      const invitation = await this.chatService.sendInvitation(
        senderId,
        receiverId,
      );

      // Уведомить получателя о приглашении
      const receiverSocketId = this.characterToSocket.get(receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('chat_invitation_received', invitation);
      }

      client.emit('invitation_sent', invitation);

      this.logger.log(`Invitation sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      this.logger.error(`Error sending invitation: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Ответить на приглашение
  @SubscribeMessage('respond_to_invitation')
  async handleRespondToInvitation(
    @MessageBody() data: RespondToInvitationDto & { characterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { characterId, invitationId, accept } = data;

    try {
      const chatRoom = await this.chatService.respondToInvitation(
        invitationId,
        accept,
      );

      if (accept && chatRoom) {
        // Присоединить обоих участников к комнате
        client.join(chatRoom.id);

        // Уведомить отправителя
        const senderId = chatRoom.participants.find(
          (p) => p.characterId !== characterId,
        )?.characterId;

        if (senderId) {
          const senderSocketId = this.characterToSocket.get(senderId);
          if (senderSocketId) {
            const senderSocket = this.server.sockets.sockets.get(senderSocketId);
            if (senderSocket) {
              await senderSocket.join(chatRoom.id);
            }
            this.server.to(senderSocketId).emit('invitation_accepted', chatRoom);
          }
        }

        client.emit('invitation_accepted', chatRoom);
      } else {
        client.emit('invitation_rejected');
      }

      this.logger.log(
        `Invitation ${invitationId} ${accept ? 'accepted' : 'rejected'}`,
      );
    } catch (error) {
      this.logger.error(`Error responding to invitation: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Получить список приглашений
  @SubscribeMessage('get_invitations')
  async handleGetInvitations(
    @MessageBody() data: { characterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const invitations = await this.chatService.getInvitations(
        data.characterId,
      );

      client.emit('invitations_list', invitations);
    } catch (error) {
      this.logger.error(`Error getting invitations: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Получить список чатов пользователя
  @SubscribeMessage('get_user_chats')
  async handleGetUserChats(
    @MessageBody() data: { characterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const chats = await this.chatService.getUserChats(data.characterId);

      client.emit('user_chats', chats);
    } catch (error) {
      this.logger.error(`Error getting user chats: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Публичный метод для создания чата боя (вызывается из PvP Gateway)
  async createBattleChatRoom(battleId: string, player1Id: number, player2Id: number): Promise<void> {
    try {
      const roomId = await this.chatService.createBattleChat(
        battleId,
        player1Id,
        player2Id,
      );

      // Уведомить обоих игроков о создании чата боя
      const player1SocketId = this.characterToSocket.get(player1Id);
      const player2SocketId = this.characterToSocket.get(player2Id);

      if (player1SocketId) {
        const socket1 = this.server.sockets.sockets.get(player1SocketId);
        if (socket1) {
          await socket1.join(roomId);
        }
        this.server.to(player1SocketId).emit('battle_chat_created', { roomId, battleId });
      }

      if (player2SocketId) {
        const socket2 = this.server.sockets.sockets.get(player2SocketId);
        if (socket2) {
          await socket2.join(roomId);
        }
        this.server.to(player2SocketId).emit('battle_chat_created', { roomId, battleId });
      }

      this.logger.log(`Battle chat created for battle ${battleId}`);
    } catch (error) {
      this.logger.error(`Error creating battle chat: ${error.message}`);
    }
  }
}
