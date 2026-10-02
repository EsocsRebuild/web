"use client";

import * as React from "react";
import { io, type Socket } from "socket.io-client";

export interface RealtimeContextValue {
  socket: Socket | null;
  isConnected: boolean;
  transport: string | null;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  emitEvent: <T = unknown>(event: string, payload: T) => void;
}

const RealtimeContext = React.createContext<RealtimeContextValue | null>(null);

let globalSocket: Socket | null = null;

function getSocketInstance(): Socket | null {
  if (typeof window === "undefined") return null;

  // Dedicated WebSocket server URL (e.g. NEXT_PUBLIC_SOCKET_URL="https://realtime.esocs.org").
  // If not configured, we do NOT open websocket connections against the Next.js HTTP server.
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!socketUrl) {
    return null;
  }

  if (!globalSocket) {
    globalSocket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 5000,
      transports: ["websocket", "polling"],
    });
  }
  return globalSocket;
}

export function RealtimeProvider({
  children,
  socket: customSocket,
}: {
  children: React.ReactNode;
  socket?: Socket | null;
}) {
  const [socket] = React.useState<Socket | null>(() => {
    if (customSocket !== undefined) return customSocket;
    if (typeof window !== "undefined") {
      return getSocketInstance();
    }
    return null;
  });

  const [isConnected, setIsConnected] = React.useState(false);
  const [transport, setTransport] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const sock = socket;
    if (!sock) return;

    const onConnect = () => {
      setIsConnected(true);
      const engineTransport = sock.io.engine?.transport?.name ?? "websocket";
      setTransport(engineTransport);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setTransport(null);
    };

    const onConnectError = () => {
      setIsConnected(false);
    };

    const onUpgrade = () => {
      const engineTransport = sock.io.engine?.transport?.name ?? null;
      setTransport(engineTransport);
    };

    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);
    sock.on("connect_error", onConnectError);

    if (sock.io.engine) {
      sock.io.engine.on("upgrade", onUpgrade);
    } else {
      sock.io.on("open", () => {
        sock.io.engine?.on("upgrade", onUpgrade);
      });
    }

    if (sock.connected) {
      onConnect();
    } else {
      sock.connect();
    }

    return () => {
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
      sock.off("connect_error", onConnectError);
      if (sock.io.engine) {
        sock.io.engine.off("upgrade", onUpgrade);
      }
    };
  }, [socket]);

  const joinRoom = React.useCallback(
    (room: string) => {
      if (!socket) return;
      socket.emit("room:join", { room });
      socket.emit("join", room);
    },
    [socket],
  );

  const leaveRoom = React.useCallback(
    (room: string) => {
      if (!socket) return;
      socket.emit("room:leave", { room });
      socket.emit("leave", room);
    },
    [socket],
  );

  const emitEvent = React.useCallback(
    <T = unknown,>(event: string, payload: T) => {
      if (!socket) return;
      socket.emit(event, payload);
    },
    [socket],
  );

  const value = React.useMemo<RealtimeContextValue>(
    () => ({
      socket,
      isConnected,
      transport,
      joinRoom,
      leaveRoom,
      emitEvent,
    }),
    [socket, isConnected, transport, joinRoom, leaveRoom, emitEvent],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextValue {
  const context = React.useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}

export function useSubscription<T>(room: string, event: string, onData: (data: T) => void): void {
  const { socket, joinRoom, leaveRoom } = useRealtime();
  const onDataRef = React.useRef(onData);

  React.useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  React.useEffect(() => {
    if (!socket) return;

    joinRoom(room);

    const handler = (data: T) => {
      onDataRef.current(data);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
      leaveRoom(room);
    };
  }, [socket, room, event, joinRoom, leaveRoom]);
}
