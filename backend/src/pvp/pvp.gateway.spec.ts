import { Test, TestingModule } from '@nestjs/testing';
import { PvpGateway } from './pvp.gateway';
import { PvpService } from './pvp.service';
import { Server, Socket } from 'socket.io';

describe('PvpGateway', () => {
  let gateway: PvpGateway;
  let pvpService: PvpService;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;

  const mockPvpService = {
    joinQueue: jest.fn(),
    leaveQueue: jest.fn(),
    submitActions: jest.fn(),
    getQueueCount: jest.fn(),
    getActiveMatchesCount: jest.fn(),
    getMatchByCharacterId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PvpGateway,
        {
          provide: PvpService,
          useValue: mockPvpService,
        },
      ],
    }).compile();

    gateway = module.get<PvpGateway>(PvpGateway);
    pvpService = module.get<PvpService>(PvpService);

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      id: 'socket1',
    };

    gateway.server = mockServer as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleJoinQueue', () => {
    it('should add player to queue', async () => {
      const queuePlayer = {
        characterId: 1,
        socketId: 'socket1',
        joinedAt: new Date(),
      };

      mockPvpService.joinQueue.mockResolvedValue(queuePlayer);
      mockPvpService.getQueueCount.mockReturnValue(1);

      const result = await gateway.handleJoinQueue(
        { characterId: 1 },
        mockClient as Socket
      );

      expect(mockPvpService.joinQueue).toHaveBeenCalledWith(1, 'socket1');
      expect(result).toEqual({
        status: 'in_queue',
        position: 1,
      });
    });

    it('should create match when two players join', async () => {
      const match = {
        id: 'match1',
        player1: {
          characterId: 1,
          socketId: 'socket1',
          hp: 200,
          maxHp: 200,
        },
        player2: {
          characterId: 2,
          socketId: 'socket2',
          hp: 150,
          maxHp: 150,
        },
        roundNumber: 1,
        status: 'active' as const,
      };

      mockPvpService.joinQueue.mockResolvedValue(match);

      const result = await gateway.handleJoinQueue(
        { characterId: 1 },
        mockClient as Socket
      );

      expect(mockServer.to).toHaveBeenCalledWith('socket1');
      expect(mockServer.to).toHaveBeenCalledWith('socket2');
      expect(mockServer.emit).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        status: 'match_found',
        matchId: 'match1',
      });
    });
  });

  describe('handleLeaveQueue', () => {
    it('should remove player from queue', () => {
      mockPvpService.leaveQueue.mockReturnValue(true);

      const result = gateway.handleLeaveQueue(
        { characterId: 1 },
        mockClient as Socket
      );

      expect(mockPvpService.leaveQueue).toHaveBeenCalledWith(1);
      expect(result).toEqual({ status: 'left_queue' });
    });

    it('should return not_in_queue if player not in queue', () => {
      mockPvpService.leaveQueue.mockReturnValue(false);

      const result = gateway.handleLeaveQueue(
        { characterId: 1 },
        mockClient as Socket
      );

      expect(result).toEqual({ status: 'not_in_queue' });
    });
  });

  describe('handleSubmitActions', () => {
    it('should submit player actions', async () => {
      mockPvpService.submitActions.mockResolvedValue({});

      await gateway.handleSubmitActions(
        {
          characterId: 1,
          actions: {
            attacks: ['head', 'body'],
            defenses: ['head', 'body', 'legs'],
          },
        },
        mockClient as Socket
      );

      expect(mockPvpService.submitActions).toHaveBeenCalledWith(
        1,
        ['head', 'body'],
        ['head', 'body', 'legs']
      );
    });

    it('should emit round result to both players', async () => {
      const roundResult = {
        roundNumber: 1,
        player1: { hp: 180, maxHp: 200, damage: 20, actions: {} },
        player2: { hp: 130, maxHp: 150, damage: 20, actions: {} },
      };

      const match = {
        id: 'match1',
        player1: { characterId: 1, socketId: 'socket1', hp: 180, maxHp: 200 },
        player2: { characterId: 2, socketId: 'socket2', hp: 130, maxHp: 150 },
        roundNumber: 2,
        status: 'active' as const,
      };

      mockPvpService.submitActions.mockResolvedValue({
        roundResult,
      });

      mockPvpService.getMatchByCharacterId.mockReturnValue(match);

      await gateway.handleSubmitActions(
        {
          characterId: 1,
          actions: {
            attacks: ['head', 'body'],
            defenses: ['head', 'body', 'legs'],
          },
        },
        mockClient as Socket
      );

      expect(mockServer.to).toHaveBeenCalledWith('socket1');
      expect(mockServer.to).toHaveBeenCalledWith('socket2');
      expect(mockServer.emit).toHaveBeenCalledTimes(2);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'round_result',
        expect.objectContaining({
          yourHp: 180,
          opponentHp: 130,
        })
      );
    });

    it('should indicate match finished when player wins', async () => {
      const roundResult = {
        roundNumber: 5,
        player1: { hp: 50, maxHp: 200, damage: 150, actions: {} },
        player2: { hp: 0, maxHp: 150, damage: 50, actions: {} },
      };

      const match = {
        id: 'match1',
        player1: { characterId: 1, socketId: 'socket1', hp: 50, maxHp: 200 },
        player2: { characterId: 2, socketId: 'socket2', hp: 0, maxHp: 150 },
        roundNumber: 6,
        status: 'finished' as const,
        winner: 1,
      };

      mockPvpService.submitActions.mockResolvedValue({
        roundResult,
        matchFinished: true,
        winner: 1,
      });

      mockPvpService.getMatchByCharacterId.mockReturnValue(match);

      await gateway.handleSubmitActions(
        {
          characterId: 1,
          actions: {
            attacks: ['head', 'body'],
            defenses: ['head', 'body', 'legs'],
          },
        },
        mockClient as Socket
      );

      expect(mockServer.emit).toHaveBeenCalledWith(
        'round_result',
        expect.objectContaining({
          matchFinished: true,
          winner: 1,
          youWon: true,
        })
      );
    });
  });

  describe('handleGetQueueStatus', () => {
    it('should return queue and match counts', () => {
      mockPvpService.getQueueCount.mockReturnValue(3);
      mockPvpService.getActiveMatchesCount.mockReturnValue(2);

      const result = gateway.handleGetQueueStatus();

      expect(result).toEqual({
        queueCount: 3,
        activeMatches: 2,
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should remove player from queue on disconnect', () => {
      gateway['socketToCharacter'].set('socket1', 1);

      gateway.handleDisconnect(mockClient as Socket);

      expect(mockPvpService.leaveQueue).toHaveBeenCalledWith(1);
    });

    it('should not call leaveQueue if player not mapped', () => {
      gateway.handleDisconnect(mockClient as Socket);

      expect(mockPvpService.leaveQueue).not.toHaveBeenCalled();
    });
  });
});
