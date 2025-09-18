export abstract class WsPacket {
    abstract domain: string;
    abstract type: string;
}

// =============================================================================
// Chat
// =============================================================================

export class ChatPacket extends WsPacket {
  domain = "chat";
  constructor(
    public type: "message" | "block",
    public data: {
      content?: string;
      userId: number;
      recipientId: number;
    },
  ) {
    super();
  }
}

// =============================================================================
// Match
// =============================================================================

export type MatchPacket =
  | { type: "match-init"; data: { matchId: string; matchType: MatchType, userIdA: number; userIdB: number } }
  | { type: "match-rejoin"; data: number }
  | { type: "match-countdown"; data: number }
  | { type: "match-update"; data: any }
  | { type: "match-over"; data: any }
  | { type: "tournament-alias"; data: any }
  | { type: "tournament-update"; data: any };

export type MatchType = "ai" | "local" | "remote" | "tournament";
type MatchControlType = "move-paddle-up" | "move-paddle-down" | "move-paddle-stop";

export const MatchPackets = {
  // --- Frontend to Backend ---
  start: (matchType: MatchType, userId: number) => ({
    type: "init-and-start-match",
    domain: "game",
    data: { matchType, userId }
  }),

  control: (matchId: string, userId: number, control: MatchControlType, paddleIndex?: number
  ) => ({
    type: "control-match",
    domain: "game",
    data: { matchId, userId, control, ...(paddleIndex !== undefined && { paddleIndex }) }
  }),

  rejoin: (userId: number) => ({
    type: "match-rejoin",
    domain: "game",
    data: { userId }
  }),
  
  // --- Backend to Frontend ---
  init: (matchId: string, userIdA: number, userIdB: number) => ({
    type: "match-init",
    domain: "game",
    data: { matchId, userIdA, userIdB }
  }),

  countdown: (count: number) => ({
    type: "match-countdown",
    domain: "game",
    data: count
  }),

  update: (game: any, ball?: any, paddles?: any) => ({
    type: "match-update",
    domain: "game",
    data: { game, ball, paddles }
  }),

  over: (matchId: string, winnerId: string, loserId: string) => ({
    type: "match-over",
    domain: "game",
    data: { matchId, winnerId, loserId }
  }),

  tournament: (userIds: any, score: any) => ({
    type: "tournament-update",
    domain: "game",
    data: { userIds, score }
  }),

  alias: (userId: number | undefined, alias: string | null) => ({
    type: "tournament-alias",
    domain: "game",
    data: { userId, alias }
  })
};


// =============================================================================
// Invitation
// =============================================================================

//@changed added invitation packet, we need the opponentId which we dont need later on

export class InvitationPacket extends WsPacket {
  domain = "game";
  constructor(
    public type: string,
    public data: {
      matchId: string;
      userIdA: number;
      userIdB: number;
    },
  ) {
    super();
  }
}

// =============================================================================
// Notification
// =============================================================================

export class NotificationPacket extends WsPacket {
  domain = "notification";
  constructor(
    public type: string,
    public data: {
      interactive: boolean;
      content: string;
      user: string;
      time: string;
      context: string;
    },
  ) {
    super();
  }
}