import sanitizer from "../sanitize/SanitizeHtml.js";

class WebsocketRoute {
  #fastify;
  #authToken;
  #connectionRegistry;
  #chatController;
  #chatRepository;
  #matchController;

  constructor(
    fastify,
    authToken,
    connectionRegistry,
    chatController,
    chatRepository,
    matchController
  ) {
    this.#fastify = fastify;
    this.#authToken = authToken;
    this.#connectionRegistry = connectionRegistry;
    this.#chatController = chatController;
    this.#chatRepository = chatRepository;
    this.#matchController = matchController;

    this.init();
  }

  init() {
    this.#registerRoute();
    console.log("WebSocket route mounted at /ws/main-ws");
    this.#startHeartbeat();
  }

  #registerRoute() {
    //test
    console.log("Websocket route triggered");
    
    //
    this.#fastify.get("/ws/main-ws", { websocket: true }, (connection, request) => {
      this.#handleConnection(connection, request);
    });
  }

  async #handleConnection(connection, request) {
    try {
      const user = await this.#authenticate(request);
      this.#registerConnection(connection, user);
      this.#setupConnectionListeners(connection);
      this.#sendWelcomeMessage(connection, user);
    } catch (error) {
      this.#handleConnectionError(connection, error);
    }
  }

  async #authenticate(request) {
    const token = this.#authToken.parseFromCookie(request.headers.cookie);
    if (!token) throw new Error("Missing token");
    return this.#authToken.verify(token);
  }

  #registerConnection(connection, user) {
    connection.user = { id: user.id, username: user.username };
    this.#connectionRegistry.addConnection(user.id, connection);
  }

  #setupConnectionListeners(connection) {
    console.log(`[WS] Connection established for user ${connection.user?.id}`);
    
    connection.isAlive = true;

    connection.on("pong", () => {
      console.log(`[WS] Pong received from user ${connection.user?.id}`);
      connection.isAlive = true;
    });

    connection.on("message", (packet) => {
      console.log(`[WS] Message received from user ${connection.user?.id}`);
      this.#handleMessage(packet, connection);
    });

    connection.on("close", () => {
      console.warn(`[WS] Socket closed for user ${connection.user?.id}`);
      this.#handleClose(connection);
    });

    connection.on("error", (err) => {
      console.error(`[WS] Socket error for user ${connection.user?.id}:`, err.message);
    });
  }

  #sendWelcomeMessage(connection, user) {
    connection.send(JSON.stringify({
      domain: "system",
      type: "connected",
      user: connection.user,
      timestamp: Date.now(),
    }));
  }

  #handleMessage(packet, connection) {
    try {
      const { domain, type, data } = JSON.parse(packet);
      const cleanContent = sanitizer.sanitize(data.content);
      data.content = cleanContent;

      switch(domain) {
        case "chat":
          console.log("WebsocketRoute: handleMessage: chat");
          this.#chatController.handle(type, data, this.#connectionRegistry, this.#chatRepository);
          break;
        case "game":
          this.#matchController.handle(type, data, connection);
          break;
        default:
          this.#sendError(connection, `Unknown domain: ${domain}`);
      }
    } catch (error) {
      this.#sendError(connection, "Invalid JSON");
    }
  }

  #handleClose(connection) {
    if (connection.user?.id) {
      this.#connectionRegistry.removeConnection(connection.user.id);
      //test
      console.log(`Socket closed for user ${connection.user?.id}`);
      //
    }
  }

  #handleConnectionError(connection, error) {
    // console.error("Connection error:", error);
    connection.send(JSON.stringify({
      domain: "system",
      type: "error",
      message: "Authentication failed. Closing connection.",
    }));
    connection.close();
  }

  #sendError(connection, message) {
    connection.send(JSON.stringify({
      domain: "error",
      type: "error",
      message,
    }));
  }

  #startHeartbeat() {
    setInterval(() => {
      for (const [userId, socket] of this.#connectionRegistry.connections.entries()) {
        if (socket.isAlive === false) {
          console.log(`WebSocket heartbeat failed: terminating connection for user ${userId}`);
          socket.terminate();
          this.#connectionRegistry.removeConnection(userId);
          continue;
        }

        socket.isAlive = false;
        try {
          console.log(`[WS] Pinging user ${userId}`);
          socket.ping();
        } catch (err) {
          console.warn(`Failed to send ping to user ${userId}:`, err.message);
        }
      }
    }, 30000); // Every 30 seconds
  }

}

export default WebsocketRoute;