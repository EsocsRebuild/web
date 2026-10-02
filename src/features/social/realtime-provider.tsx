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

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!socketUrl) return null;

  if (!globalSocket) {
    globalSocket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
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
  const getSnapshot = React.useCallback(
    () => (customSocket !== undefined ? customSocket : getSocketInstance()),
    [customSocket],
  );
  const getServerSnapshot = React.useCallback(() => null, []);
  const emptySubscribe = React.useCallback(() => () => {}, []);

  const socket = React.useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  const [isConnected, setIsConnected] = React.useState(false);
  const [transport, setTransport] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      const engineTransport = socket.io.engine?.transport?.name ?? "websocket";
      setTransport(engineTransport);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setTransport(null);
    };

    const onUpgrade = () => {
      const engineTransport = socket.io.engine?.transport?.name ?? null;
      setTransport(engineTransport);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.io.engine) {
      socket.io.engine.on("upgrade", onUpgrade);
    } else {
      socket.io.on("open", () => {
        socket.io.engine?.on("upgrade", onUpgrade);
      });
    }

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      if (socket.io.engine) {
        socket.io.engine.off("upgrade", onUpgrade);
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
