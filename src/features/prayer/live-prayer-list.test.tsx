import { render, screen, fireEvent, act } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { LivePrayerList, type PrayerItem } from "./live-prayer-list";
import { RealtimeProvider } from "@/features/social/realtime-provider";

function createMockSocket() {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
  const emits: { event: string; payload: unknown }[] = [];

  const mockSocket = {
    connected: true,
    io: {
      engine: {
        transport: { name: "websocket" },
        on: vi.fn(),
        off: vi.fn(),
      },
      on: vi.fn(),
    },
    connect: vi.fn(() => mockSocket),
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

const mockInitialPrayers: PrayerItem[] = [
  {
    id: "p-test-1",
    name: "Brother Caleb",
    request: "Strength and guidance for my studies.",
    createdAt: new Date().toISOString(),
    prayingCount: 5,
  },
];

describe("LivePrayerList", () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    mockSocket = createMockSocket();
  });

  it("renders prayer list and allows optimistic agreement click", async () => {
    render(
      <RealtimeProvider socket={mockSocket as never}>
        <LivePrayerList initialPrayers={mockInitialPrayers} />
      </RealtimeProvider>,
    );

    expect(screen.getByText("Brother Caleb")).toBeDefined();
    expect(screen.getByText("Strength and guidance for my studies.")).toBeDefined();
    expect(screen.getByText("5 praying")).toBeDefined();

    const supportBtn = screen.getByRole("button", { name: /Pray With Brother/i });
    fireEvent.click(supportBtn);

    // Optimistically updated counter to 6
    expect(screen.getByText("6 praying")).toBeDefined();
    expect(screen.getByRole("button", { name: /Praying With You/i })).toBeDefined();

    expect(mockSocket.emit).toHaveBeenCalledWith("prayer:support", {
      prayerId: "p-test-1",
      userId: expect.any(String),
    });
  });

  it("appends new prayer when prayer:new event is received", async () => {
    render(
      <RealtimeProvider socket={mockSocket as never}>
        <LivePrayerList initialPrayers={mockInitialPrayers} />
      </RealtimeProvider>,
    );

    act(() => {
      mockSocket._trigger("prayer:new", {
        id: "p-test-2",
        name: "Sister Hannah",
        request: "Thanksgiving for new employment.",
        createdAt: new Date().toISOString(),
        prayingCount: 1,
      });
    });

    expect(screen.getByText("Sister Hannah")).toBeDefined();
    expect(screen.getByText("Thanksgiving for new employment.")).toBeDefined();
  });

  it("updates counter when prayer:increment event is received", async () => {
    render(
      <RealtimeProvider socket={mockSocket as never}>
        <LivePrayerList initialPrayers={mockInitialPrayers} />
      </RealtimeProvider>,
    );

    act(() => {
      mockSocket._trigger("prayer:increment", {
        prayerId: "p-test-1",
        prayingCount: 15,
      });
    });

    expect(screen.getByText("15 praying")).toBeDefined();
  });
});
