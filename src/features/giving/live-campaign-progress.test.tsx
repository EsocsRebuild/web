import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { LiveCampaignProgress } from "./live-campaign-progress";
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

describe("LiveCampaignProgress", () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    mockSocket = createMockSocket();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sessionId: "don_sess_test_123",
          amount: 25000,
          currency: "NGN",
          status: "initialized",
        }),
      }),
    );
  });

  it("renders campaign details and updates in real-time when a gift settles", async () => {
    render(
      <RealtimeProvider socket={mockSocket as never}>
        <LiveCampaignProgress
          campaignId="test-camp-1"
          title="Community Welfare Drive"
          targetAmount={1000000}
          initialRaised={500000}
          initialDonors={10}
        />
      </RealtimeProvider>,
    );

    expect(screen.getByText("Community Welfare Drive")).toBeDefined();
    expect(screen.getByText("₦500,000")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();

    // Trigger settled donation event for this campaign
    act(() => {
      mockSocket._trigger("finance:giving:settled", {
        campaignId: "test-camp-1",
        amount: 50000,
        donorName: "Brother John",
        currency: "NGN",
      });
    });

    // Raised increased to 550,000 and donor count increased to 11
    expect(screen.getByText("₦550,000")).toBeDefined();
    expect(screen.getByText("11")).toBeDefined();
    expect(screen.getByText("Brother John")).toBeDefined();
  });

  it("submits giving session to backend and emits settlement", async () => {
    render(
      <RealtimeProvider socket={mockSocket as never}>
        <LiveCampaignProgress campaignId="test-camp-1" targetAmount={1000000} initialRaised={100000} />
      </RealtimeProvider>,
    );

    const submitBtn = screen.getByRole("button", { name: /Give ₦25,000 Now/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/donations/initialize",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    expect(mockSocket.emit).toHaveBeenCalledWith("finance:giving:settled", {
      campaignId: "test-camp-1",
      amount: 25000,
      donorName: "Anonymous Saint",
      currency: "NGN",
    });
  });
});
