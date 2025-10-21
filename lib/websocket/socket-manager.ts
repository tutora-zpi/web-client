type MessageHandler = (data: unknown) => void;

interface WebSocketMessage {
  name: string;
  data: unknown;
}

class SocketManager {
  private static instance: SocketManager | null = null;
  private socket: WebSocket | null = null;
  private connectionPromise: Promise<WebSocket> | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private constructor() {
    this.socket = null;
    this.connectionPromise = null;
    this.messageHandlers = new Map();
  }

  connect(url: string): Promise<WebSocket> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("Socket connected!");
        resolve(this.socket!);
      };

      this.socket.onerror = (error: Event) => {
        console.error("Socket error", error);
        reject(error);
      };

      this.socket.onmessage = (event: MessageEvent) => {
        const data: WebSocketMessage = JSON.parse(event.data);

        if (data.name && this.messageHandlers.has(data.name)) {
          this.messageHandlers
            .get(data.name)
            ?.forEach((handler) => handler(data));
        }
      };
    });

    return this.connectionPromise;
  }

  on(messageType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);
  }

  off(messageType: string, handler: MessageHandler): void {
    this.messageHandlers.get(messageType)?.delete(handler);
  }

  send(data: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.connectionPromise = null;
  }
}

export default SocketManager.getInstance();
