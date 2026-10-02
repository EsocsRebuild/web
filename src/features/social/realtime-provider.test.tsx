import { renderHook, act } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { RealtimeProvider, useRealtime, useSubscription } from "./realtime-provider";

function createMockSocket() {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  const emits: { event: string; payload: unknown }[] = [];

  const mockSocket = {
    connected: false,
    io: {
      engine: {
        transport: { name: "websocket" },
        on: vi.fn(),
        off: vi.fn(),
      },
      on: vi.fn(),
    },
    connect: vi.fn(() => {
      mockSocket.connected = true;
      (listeners["connect"] ?? []).forEach((fn) => fn());
      return mockSocket;
    }),
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(callback);
      return mockSocket;
    }),
    off: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      listeners[event] = (listeners[event] ?? []).filter((fn) => fn !== callback);
      return mockSocket;
    }),
    emit: vi.fn((event: string, payload: unknown) => {
      emits.push({ event, payload });
      return mockSocket;
    }),
    _trigger: (event: string, ...args: unknown[]) => {
      (listeners[event] ?? []).forEach((fn) => fn(...args));
    },
    _emits: emits,
  };

  return mockSocket;
}

describe("RealtimeProvider & hooks", () => {
  it("provides connection state and helper utilities", () => {
    const mockSocket = createMockSocket();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RealtimeProvider socket={mockSocket as never}>{children}</RealtimeProvider>
    );

    const { result } = renderHook(() => useRealtime(), { wrapper });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.transport).toBe("websocket");

    act(() => {
      result.current.joinRoom("prayer:wall");
    });
    expect(mockSocket.emit).toHaveBeenCalledWith("room:join", { room: "prayer:wall" });
    expect(mockSocket.emit).toHaveBeenCalledWith("join", "prayer:wall");

    act(() => {
      result.current.leaveRoom("prayer:wall");
    });
    expect(mockSocket.emit).toHaveBeenCalledWith("room:leave", { room: "prayer:wall" });
    expect(mockSocket.emit).toHaveBeenCalledWith("leave", "prayer:wall");

    act(() => {
      result.current.emitEvent("prayer:support", { prayerId: "p1", userId: "u1" });
    });
    expect(mockSocket.emit).toHaveBeenCalledWith("prayer:support", {
      prayerId: "p1",
      userId: "u1",
    });
  });

  it("useSubscription joins room on mount and cleans up on unmount", () => {
    const mockSocket = createMockSocket();
    const onData = vi.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RealtimeProvider socket={mockSocket as never}>{children}</RealtimeProvider>
    );

    const { unmount } = renderHook(() => useSubscription("prayer:wall", "prayer:new", onData), { wrapper });

    expect(mockSocket.emit).toHaveBeenCalledWith("room:join", { room: "prayer:wall" });
    expect(mockSocket.on).toHaveBeenCalledWith("prayer:new", expect.any(Function));

    // Simulate incoming event
    act(() => {
      mockSocket._trigger("prayer:new", { id: "p1", text: "Lord hear our prayer" });
    });
    expect(onData).toHaveBeenCalledWith({ id: "p1", text: "Lord hear our prayer" });

    // Unmount
    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith("prayer:new", expect.any(Function));
    expect(mockSocket.emit).toHaveBeenCalledWith("room:leave", { room: "prayer:wall" });
  });
});
