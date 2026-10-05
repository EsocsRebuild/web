"use client";

import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import * as React from "react";
import type { Socket } from "socket.io-client";

export interface RealtimeContextValue {
  socket: Socket | null;
  connection: HubConnection | null;
  isConnected: boolean;
  transport: string | null;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  emitEvent: <T = unknown>(event: string, payload: T) => void;
}

const RealtimeContext = React.createContext<RealtimeContextValue | null>(null);

let globalSignalRConnection: HubConnection | null = null;

function getSignalRUrl(): string | null {
  if (typeof window === "undefined") return null;
  return (
    process.env.NEXT_PUBLIC_SIGNALR_URL ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    null
  );
}

function getSignalRConnection(): HubConnection | null {
  const url = getSignalRUrl();
  if (!url) return null;

  if (!globalSignalRConnection) {
    const hubUrl = url.includes("/hubs/") ? url : `${url.replace(/\/api\/v1\/?$/, "")}/hubs/platform`;

    globalSignalRConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          if (typeof window !== "undefined") {
            return localStorage.getItem("accessToken") || "";
          }
          return "";
        },
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .configureLogging(LogLevel.None)
      .build();
  }

  return globalSignalRConnection;
}

export function RealtimeProvider({
  children,
  socket: customSocket,
}: {
  children: React.ReactNode;
  socket?: Socket | null;
}) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [transport, setTransport] = React.useState<string | null>(null);
  const isCustom = customSocket !== undefined;
  const connection = React.useMemo(() => {
    if (typeof window === "undefined" || isCustom) return null;
    return getSignalRConnection();
  }, [isCustom]);

  React.useEffect(() => {
    if (isCustom) {
      if (!customSocket) {
        return;
      }

      const onConnect = () => {
        setIsConnected(true);
        const engineTransport = customSocket.io?.engine?.transport?.name ?? "websocket";
        setTransport(engineTransport);
      };

      const onDisconnect = () => {
        setIsConnected(false);
        setTransport(null);
      };

      const onUpgrade = () => {
        const engineTransport = customSocket.io?.engine?.transport?.name ?? null;
        setTransport(engineTransport);
      };

      customSocket.on("connect", onConnect);
      customSocket.on("disconnect", onDisconnect);

      if (customSocket.io?.engine) {
        customSocket.io.engine.on?.("upgrade", onUpgrade);
      }

      if (customSocket.connected) {
        onConnect();
      } else if (typeof customSocket.connect === "function") {
        customSocket.connect();
      }

      return () => {
        customSocket.off("connect", onConnect);
        customSocket.off("disconnect", onDisconnect);
      };
    }

    // In production browser, connect to SignalR
    const conn = connection;
    if (!conn) {
      return;
    }

    const startConnection = async () => {
      try {
        if (conn.state === HubConnectionState.Disconnected) {
          await conn.start();
          setIsConnected(true);
          setTransport("WebSockets");
        }
      } catch {
        setIsConnected(false);
        setTransport(null);
      }
    };

    conn.onreconnecting(() => {
      setIsConnected(false);
    });

    conn.onreconnected(() => {
      setIsConnected(true);
      setTransport("WebSockets");
    });

    conn.onclose(() => {
      setIsConnected(false);
      setTransport(null);
    });

    startConnection();

    return () => {
      // Keep connection pooled or stop on full teardown
    };
  }, [customSocket, isCustom, connection]);

  const joinRoom = React.useCallback(
    (room: string) => {
      if (customSocket) {
        customSocket.emit("room:join", { room });
        customSocket.emit("join", room);
        return;
      }

      if (connection && connection.state === HubConnectionState.Connected) {
        if (room === "prayer:wall" || room === "prayer:wall:global") {
          connection.invoke("JoinPrayerWall").catch(() => {});
        } else if (room.startsWith("finance:campaign:")) {
          const campaignId = room.replace("finance:campaign:", "");
          connection.invoke("JoinCampaignRoom", campaignId).catch(() => {});
        } else if (room.startsWith("service:stream:")) {
          const branchId = room.replace("service:stream:", "");
          connection.invoke("JoinLiveService", branchId).catch(() => {});
        }
      }
    },
    [customSocket, connection],
  );

  const leaveRoom = React.useCallback(
    (room: string) => {
      if (customSocket) {
        customSocket.emit("room:leave", { room });
        customSocket.emit("leave", room);
        return;
      }

      if (connection && connection.state === HubConnectionState.Connected) {
        if (room === "prayer:wall" || room === "prayer:wall:global") {
          connection.invoke("LeavePrayerWall").catch(() => {});
        } else if (room.startsWith("finance:campaign:")) {
          const campaignId = room.replace("finance:campaign:", "");
          connection.invoke("LeaveCampaignRoom", campaignId).catch(() => {});
        } else if (room.startsWith("service:stream:")) {
          const branchId = room.replace("service:stream:", "");
          connection.invoke("LeaveLiveService", branchId).catch(() => {});
        }
      }
    },
    [customSocket, connection],
  );

  const emitEvent = React.useCallback(
    <T = unknown,>(event: string, payload: T) => {
      if (customSocket) {
        customSocket.emit(event, payload);
        return;
      }

      if (connection && connection.state === HubConnectionState.Connected) {
        connection.invoke("SendClientEvent", event, payload).catch(() => {});
      }
    },
    [customSocket, connection],
  );

  const value = React.useMemo<RealtimeContextValue>(
    () => ({
      socket: customSocket ?? null,
      connection,
      isConnected,
      transport,
      joinRoom,
      leaveRoom,
      emitEvent,
    }),
    [customSocket, connection, isConnected, transport, joinRoom, leaveRoom, emitEvent],
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
  const { socket, connection, joinRoom, leaveRoom } = useRealtime();
  const onDataRef = React.useRef(onData);

  React.useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  React.useEffect(() => {
    joinRoom(room);

    // If using custom socket (e.g. tests or socket.io)
    if (socket) {
      const handler = (data: T) => {
        onDataRef.current(data);
      };

      socket.on(event, handler);

      return () => {
        socket.off(event, handler);
        leaveRoom(room);
      };
    }

    // If using SignalR connection
    if (connection) {
      // Map event names to SignalR method broadcasts
      const signalRHandler = (...args: unknown[]) => {
        if (event === "prayer:new" && args.length >= 5) {
          // ReceivePrayerUpdate(Guid prayerId, string title, string? content, string authorName, DateTimeOffset createdAt)
          const mapped = {
            id: args[0],
            name: args[3] || "Anonymous",
            request: args[2] || args[1] || "",
            createdAt: args[4] || new Date().toISOString(),
            prayingCount: 1,
          } as unknown as T;
          onDataRef.current(mapped);
        } else if (event === "finance:giving:settled" && args.length >= 4) {
          // ReceiveCampaignProgress(Guid campaignId, decimal raisedAmount, decimal goalAmount, decimal percentage)
          const mapped = {
            campaignId: args[0],
            amount: args[1],
            raisedAmount: args[1],
            goalAmount: args[2],
            percentage: args[3],
          } as unknown as T;
          onDataRef.current(mapped);
        } else if (args.length === 1) {
          onDataRef.current(args[0] as T);
        } else {
          onDataRef.current(args as unknown as T);
        }
      };

      // Register both the raw event name and the typed SignalR method
      const signalRMethodName =
        event === "prayer:new"
          ? "ReceivePrayerUpdate"
          : event === "finance:giving:settled"
            ? "ReceiveCampaignProgress"
            : event;

      connection.on(event, signalRHandler);
      if (signalRMethodName !== event) {
        connection.on(signalRMethodName, signalRHandler);
      }

      return () => {
        connection.off(event, signalRHandler);
        if (signalRMethodName !== event) {
          connection.off(signalRMethodName, signalRHandler);
        }
        leaveRoom(room);
      };
    }

    return () => {
      leaveRoom(room);
    };
  }, [socket, connection, room, event, joinRoom, leaveRoom]);
}
