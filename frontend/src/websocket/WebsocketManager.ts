import { WsPacket } from "./WsPacket.js";

class WebsocketManager {
    private socket: WebSocket | null = null;
    private connected = false;
    private url: String;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private heartbeatInterval: number | null = null;

    constructor(url: string) {
        this.url = url;
    }

    connect() {
        console.log("WebSocketManager: attempting connection; current state:", {
            existingSocket: this.socket,
            readyState: this.socket?.readyState
        });

        if (this.socket && (this.socket.readyState === WebSocket.OPEN ||
            this.socket.readyState === WebSocket.CONNECTING)) {
            console.log("WebSocketManager: socket already exists. Ready state:", this.socket.readyState);
            return;
        }

        if (!window.app.state.user) {
            // console.warn("WebsocketManager: user not set; websocket connection skipped");
            return;
        }

        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const cleanedUrl = this.url.startsWith("/") ? this.url.slice(1) : this.url;
        this.socket = new WebSocket(`${protocol}://${window.location.host}/${cleanedUrl}`);
        // console.log("WebsocketManager: websocket now connected to:", `${protocol}://${window.location.host}/${cleanedUrl}`);

        this.socket.addEventListener("open", () => {
            this.connected = true;
            this.reconnectAttempts = 0; // Reset on successful connection
            console.log("WebSocketManager: connection opened");
            window.dispatchEvent(new Event("ws:open"));

        });

        this.socket.addEventListener("message", (event) => {
            try {
                const data = JSON.parse(event.data);
                //console.log("WebsocketManager: received packet from backend:", data);
            
                if (data?.domain) {
                    window.dispatchEvent(new CustomEvent(data.domain, { detail: data }));
                    // console.log(`WebsocketManager: dispatched event for domain "${data.domain}"`);

                    if (data?.domain === "game" && data.type === "match-redirect") {
                        // Dispatch custom event for redirection
                        window.dispatchEvent(new CustomEvent('ws:redirect', {}));
                    }
                } else {
                    // console.warn("WebsocketManager: websocket received packet without domain:", data);
                }
            } catch (error) {
                // console.error("WebsocketManager: websocket received invalid JSON:", event.data);
            }
        });

        this.socket.addEventListener("close", (event) => {
            this.connected = false;
            console.log(`WebSocket closed`, event.code, event.reason, event.wasClean);
            window.dispatchEvent(new Event("ws:close"));
            this.cleanupHeartbeat();
            this.tryReconnect();
        });

        this.socket.addEventListener("error", (event) => {
            // console.error("WebsocketManager: websocket error:", event);
            window.dispatchEvent(new Event("ws:error"));
        });
    }

    private tryReconnect() {
        // console.log("Trying to reconnect yeah");
        if (!window.app.state.user) {
            // console.warn("WebsocketManager: no user, skipping reconnect.");
            return;
        }
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            // console.log(`WebsocketManager: attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay);
        } else {
            // console.warn("WebsocketManager: max reconnect attempts reached. Giving up.");
        }
    }

    send(packet: WsPacket) {
        // console.log("WebsocketManager: sending packet from frontend to backend:", packet);
        try {
            if (this.connected && this.socket) {
                this.socket.send(JSON.stringify(packet));
            } else {
                if (!window.app.state.user) {
                    // console.warn("WebsocketManager: no user, not attempting to reconnect.");
                    return;
                }
                // console.warn("WebsocketManager: websocket not connected, can't send");
                this.tryReconnect();
            }
        } catch (error) {
            // console.error("WebsocketManager: websocket send error:", error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.connected = false;
            this.cleanupHeartbeat(); 
            // console.log("WebsocketManager: manually disconnected.");
        }
    }

    private cleanupHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

}

const websocketManager = new WebsocketManager("/ws/main-ws");
export default websocketManager;
