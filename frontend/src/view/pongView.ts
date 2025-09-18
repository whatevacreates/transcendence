import dom from "../shared/dom.js";
import api from "../shared/api/api.js";
import validate from "../shared/util/validate.js";

// --- Websocket ---
import websocketManager from "../websocket/WebsocketManager.js";
import { MatchPacket, MatchPackets, MatchType } from "../websocket/WsPacket.js";

// --- Components ---
import pongComponent from "../component/pong/pongComponent.js";
import scoreboardComponent from "../component/pong/scoreboardComponent.js";
import tournamentComponent from "../component/pong/tournamentComponent.js";

// --- Interfaces ---

interface Match {
  players: [string, string];
  scores: [number, number];
}

interface TournamentProps {
  semiFinals: Match[];
  final: Match | null;
}

// --- Generate random funny aliases ---
const generateRandomAlias = () => {
  const adjectives = ["Silly", "Fast", "Slow", "Crazy", "Epic", "Lazy", "Fierce", "Sneaky", "Blind"];
  const nouns = ["Panda", "Ninja", "Coder", "Wizard", "Banana", "Potato", "Cat", "Pirate", "Turtle"];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
};

async function PongView(): Promise<HTMLElement> {
  const pongView = dom.create(`
    <main data-page="pong" class="w-full w-6lg text-black">
      <div data-id="pong-area" class="justify-items-center">
        <div data-id="pong-scoreboard" class="w-full"><!-- Scoreboard --></div>
        <div data-id="pong-tournament-scoreboard"><!-- Tournament scoreboard --></div>
        <div class="flex justify-center gap-6 mb-8 mt-6">
  <button data-id="pong-start-ai"
    class="text-[1.1rem] animationBtn border-4 border-secondary inline-flex justify-center items-center rounded-full bg-transparent font-headline px-3 py-3 font-bold text-lightText min-w-[300px]">
    <span class="fill-bg"></span>
    <span class="button-content">Play vs AI</span>
  </button>

  <button data-id="pong-start-local"
    class="text-[1.1rem] animationBtn border-4 border-secondary inline-flex justify-center items-center rounded-full bg-transparent font-headline px-3 py-3 font-bold text-lightText min-w-[300px]">
    <span class="fill-bg"></span>
    <span class="button-content">Play vs Local</span>
  </button>
</div>

        <div data-id="pong-game"><!-- Pong --></div>

      </div>
    </main>
  `);

  const selectors = {
    pongScoreboard: pongView.querySelector('[data-id="pong-scoreboard"]') as HTMLElement,
    pongTournamentScoreboard: pongView.querySelector('[data-id="pong-tournament-scoreboard"]') as HTMLElement,
    pongGame: pongView.querySelector('[data-id="pong-game"]') as HTMLElement,
    pongStartAi: pongView.querySelector('[data-id="pong-start-ai"]') as HTMLElement,
    pongStartLocal: pongView.querySelector('[data-id="pong-start-local"]') as HTMLElement,
  };

  let pongController: ReturnType<typeof pongComponent> | null = null;
  let scoreboardController: ReturnType<typeof scoreboardComponent> | null = null;
  let tournamentController: ReturnType<typeof tournamentComponent> | null = null;

  let keyDownCleanup: (() => void) | null = null;
  let keyUpCleanup: (() => void) | null = null;

  let config: any = null;
  let gameState: any = null;
  let matchId: string | null = null; 
  let playerId: number | undefined = window.app?.state?.user?.id;
  let currentMatchType: MatchType | null = null;
  let matchOverHandled = false;
  
  // Alias input state
  let aliasInputActive = false;
  let aliasInputTimeout: number | null = null;

  // Temp memory of last packets for missed-mount replay
  let lastMatchInitPacket: any = null;
  let lastTournamentUpdatePacket: any = null;

  // Store last tournament data for re-rendering
  let lastTournamentData = null;

  // Add these variables at the top of PongView
  let aliasGenerated = false;
  let randomAlias: string | null = null;

  // --- Fetch config from backend ---
  try {
    const res = await fetch("/api/match/config");
    config = await res.json();
  } catch (err) {
    console.error("Failed to load Pong config:", err);
  }

  // --- Rejoin ---
  if (playerId) {
    websocketManager.send(MatchPackets.rejoin(playerId));
  }

  const fetchPlayerDetails = async (
    userId: number | null | undefined,
    matchType: string | null
  ): Promise<string> => {
    if (!userId) return "You are playing againts ai";
    try {
      const username = await api.fetchUsername(userId);
  
      if (matchType === "tournament") {
        const alias = await api.fetchAlias(userId);
        return alias ? `${username} (${alias})` : username;
      }
  
      return username;
    } catch (err) {
      console.error(`Failed to fetch player details for user ${userId}:`, err);
      return "Unknown";
    }
  };  

  const sendMove = (direction: "up" | "down" | "stop", paddleIndex?: number) => {
    if (!matchId || playerId == null || aliasInputActive) return;
    const action = direction === "up"
      ? "move-paddle-up"
      : direction === "down"
      ? "move-paddle-down"
      : "move-paddle-stop";

    websocketManager.send(MatchPackets.control(matchId, playerId, action, paddleIndex));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent arrow keys from scrolling the page
    if (["ArrowUp", "ArrowDown", "w", "W", "s", "S"].includes(e.key)) {
      e.preventDefault();
    }
    
    // If alias input is active, focus the input
    if (aliasInputActive && e.key !== "Escape") {
      const input = document.querySelector<HTMLInputElement>('[data-id="alias-input"]');
      if (input) {
        input.focus();
        return;
      }
    }
    
    // Handle game controls
    switch (e.key) {
      case "ArrowUp":
        sendMove("up", currentMatchType === "local" ? 1 : undefined);
        break;
      case "ArrowDown":
        sendMove("down", currentMatchType === "local" ? 1 : undefined);
        break;
      case "w":
      case "W":
        sendMove("up");
        break;
      case "s":
      case "S":
        sendMove("down");
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "w":
      case "W":
      case "s":
      case "S":
        sendMove("stop");
        break;
    }
  };

  dom.registerEvent(selectors.pongStartAi, "click", () => {
    if (!playerId) return alert("Missing player ID");
    selectors.pongStartAi.classList.add('hidden');
    selectors.pongStartLocal.classList.add('hidden');
    websocketManager.send(MatchPackets.start("ai", playerId));
  });

  dom.registerEvent(selectors.pongStartLocal, "click", () => {
    if (!playerId) return alert("Missing player ID");
     selectors.pongStartAi.classList.add('hidden');
     selectors.pongStartLocal.classList.add('hidden');
    websocketManager.send(MatchPackets.start("local", playerId));
  });

  const matchPacketHandlers = {
    "match-init": async (data: any) => {
      selectors.pongStartAi.classList.add('hidden');
      selectors.pongStartLocal.classList.add('hidden');
      lastMatchInitPacket = { type: "match-init", data };
      matchId = data.matchId;
      currentMatchType = data.matchType;
      matchOverHandled = false;

      keyDownCleanup?.();
      keyUpCleanup?.();
      

      try {
        const [userA, userB] = await Promise.all([
          fetchPlayerDetails(data.userIdA, data.matchType),
          fetchPlayerDetails(data.userIdB, data.matchType),
        ]);
        scoreboardController = scoreboardComponent(data.userIdA, data.userIdB, userA, userB, 0, 0);
        dom.mount(selectors.pongScoreboard, scoreboardController.element);
      } catch (err) {
        console.error("Failed to init scoreboard:", err);
      }

      keyDownCleanup = dom.registerEvent(document, "keydown", handleKeyDown);
      keyUpCleanup = dom.registerEvent(document, "keyup", handleKeyUp);
    },

    "match-redirect": (data: any) => {
      return ;
    },

    "match-countdown": (data: number) => {
      if (!pongController) return;
      pongController.drawOverlayText(String(data));
      if (data === 0) {
        setTimeout(() => {
          pongController?.clearOverlayText();
        }, 1000);
      }
    },

    "match-update": (data: any) => {
      gameState = data.game;
      if (scoreboardController) {
        scoreboardController.update({
          scoreA: gameState.scores?.[0] ?? 0,
          scoreB: gameState.scores?.[1] ?? 0
        });
      }
      pongController?.update({
        ball: data.ball,
        paddles: data.paddles
      });
    },

    "match-over": async (data: any) => {
      matchId = null;
      keyDownCleanup?.(); keyUpCleanup?.();
      keyDownCleanup = keyUpCleanup = null;
       selectors.pongStartLocal.classList.remove('hidden');
      selectors.pongStartAi.classList.remove('hidden');
      if (!matchOverHandled) {
        matchOverHandled = true;
        const winner = await fetchPlayerDetails(data.winnerId, currentMatchType);
        alert(`The winner is *${winner}*!`);
      }
    },

    "tournament-update": async (data: any) => {
      lastTournamentData = data; // Store for re-rendering

      const transformMatch = async (match: any): Promise<Match> => {
        const [p1, p2] = await Promise.all([
          fetchPlayerDetails(match.players[0], "tournament"),
          fetchPlayerDetails(match.players[1], "tournament")
        ]);
        return { players: [p1, p2], scores: match.scores };
      };

      try {
        const semiFinals = await Promise.all(data.semiFinals.map(transformMatch));
        const final = data.final ? await transformMatch(data.final) : null;
        const tournamentData: TournamentProps = { semiFinals, final };

        // Always re-render tournament component
        tournamentController = tournamentComponent(tournamentData);
        dom.mount(selectors.pongTournamentScoreboard, tournamentController.element);
      } catch (err) {
        console.error("Error processing tournament data:", err);
      }
    },

    // Then modify the tournament-alias handler
    "tournament-alias": async () => {
      if (!playerId || aliasGenerated) return; // Prevent re-generation
      
      // Clear any existing timeout
      if (aliasInputTimeout) {
          clearTimeout(aliasInputTimeout);
          aliasInputTimeout = null;
      }
      
      // Generate alias only once
      if (!randomAlias) {
          randomAlias = generateRandomAlias();
      }
      aliasGenerated = true;
      
      aliasInputActive = true;
      
      // Show input on canvas
      pongController?.showAliasInput(
          randomAlias,
          (alias) => {
              aliasInputActive = false;
              const result = validate.validateAlias(alias);
              if (result.valid) {
                websocketManager.send(MatchPackets.alias(playerId, alias));
              } else {
                console.warn(`Alias validation failed: ${result.error}`);
                websocketManager.send(MatchPackets.alias(playerId, randomAlias!));
              }
          },
          10 // 10 second timeout
      );
    }
  };
  
  dom.registerEvent(window, "game", async (event) => {
    try {
      const packet = (event as CustomEvent).detail;
    
      if (packet.type in matchPacketHandlers) {
        const handler = matchPacketHandlers[packet.type as keyof typeof matchPacketHandlers];
        await handler(packet.data);
      } else {
        console.warn(`Unknown packet type received: ${packet.type}`);
      }
    } catch (err) {
      console.error("Error handling match packet:", err);
    }
  });
  

  pongController = pongComponent({
    width: window.innerWidth,
    height: window.innerWidth * (9 / 16),
    config
  });
  dom.mount(selectors.pongGame, pongController.element);

  // Render tournament component if data exists
  if (lastTournamentData) {
    await matchPacketHandlers["tournament-update"](lastTournamentData);
  }

  return pongView;
}

export default PongView;