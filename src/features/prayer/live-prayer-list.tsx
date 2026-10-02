"use client";

import { Check, Flame, HeartHandshake, Loader2, Sparkles, Users } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { useOptionalSocial } from "@/features/social/provider";
import { useRealtime, useSubscription } from "@/features/social/realtime-provider";
import { formatDate } from "@/lib/format";

export interface PrayerItem {
  id: string;
  name: string;
  request: string;
  createdAt: string;
  prayingCount: number;
  hasSupported?: boolean;
}

export interface PrayerIncrementPayload {
  prayerId: string;
  prayingCount?: number;
}

const INITIAL_PRAYERS: PrayerItem[] = [
  {
    id: "prayer-init-1",
    name: "Sister Deborah O.",
    request:
      "Praying for divine health and safe delivery for my sister in Lagos, and that God grants strength to the entire family during this season.",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    prayingCount: 24,
  },
  {
    id: "prayer-init-2",
    name: "Brother Michael A.",
    request:
      "Thanksgiving for open doors in my engineering career after 8 months of seeking, and prayer for wisdom to excel in this new assignment.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    prayingCount: 18,
  },
  {
    id: "prayer-init-3",
    name: "Elder Samuel B.",
    request:
      "Praying for peace, unity, and spiritual revival across all ESOCS provinces, especially for our youths stepping into ministry leadership.",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    prayingCount: 42,
  },
];

export function LivePrayerList({ initialPrayers = INITIAL_PRAYERS }: { initialPrayers?: PrayerItem[] }) {
  const [prayers, setPrayers] = React.useState<PrayerItem[]>(initialPrayers);
  const [pendingPrayers, setPendingPrayers] = React.useState<ReadonlySet<string>>(new Set());
  const { isConnected, emitEvent } = useRealtime();
  const social = useOptionalSocial();
  const member = social?.member;

  // Listen for prayer:new in room prayer:wall
  useSubscription<PrayerItem>("prayer:wall", "prayer:new", (newPrayer) => {
    setPrayers((prev) => {
      if (prev.some((p) => p.id === newPrayer.id)) return prev;
      return [newPrayer, ...prev];
    });
  });

  // Listen for prayer:increment in room prayer:wall
  useSubscription<PrayerIncrementPayload>("prayer:wall", "prayer:increment", (payload) => {
    setPrayers((prev) =>
      prev.map((item) => {
        if (item.id !== payload.prayerId) return item;
        const updatedCount =
          payload.prayingCount !== undefined ? payload.prayingCount : item.prayingCount + 1;
        return {
          ...item,
          prayingCount: updatedCount,
        };
      }),
    );
  });

  const handleSupport = React.useCallback(
    async (prayerId: string) => {
      const target = prayers.find((p) => p.id === prayerId);
      if (!target || target.hasSupported || pendingPrayers.has(prayerId)) return;

      const previousPrayers = prayers;

      // 1. Optimistic update
      setPrayers((prev) =>
        prev.map((item) =>
          item.id === prayerId
            ? {
                ...item,
                prayingCount: item.prayingCount + 1,
                hasSupported: true,
              }
            : item,
        ),
      );

      setPendingPrayers((prev) => new Set(prev).add(prayerId));

      try {
        // Simulated network check / offline handling
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          throw new Error("Network offline");
        }

        const userId =
          member?.id ??
          `anon-${Array.from(crypto.getRandomValues(new Uint8Array(4)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, 7)}`;

        emitEvent("prayer:support", {
          prayerId,
          userId,
        });

        // Also emit local increment broadcast
        emitEvent("prayer:increment", {
          prayerId,
          prayingCount: target.prayingCount + 1,
        });
      } catch {
        // Rollback on network error
        setPrayers(previousPrayers);
        toast.error("Could not register prayer support. Please check your connection.");
      } finally {
        setPendingPrayers((prev) => {
          const next = new Set(prev);
          next.delete(prayerId);
          return next;
        });
      }
    },
    [prayers, pendingPrayers, member, emitEvent],
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-display-xs font-display font-bold text-foreground">Live Prayer Wall</h2>
            <span
              className={`text-2xs inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 font-semibold ${
                isConnected ? "bg-success/10 text-success" : "bg-surface-muted text-muted-foreground"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isConnected ? "animate-pulse bg-success" : "bg-muted-foreground"
                }`}
              />
              {isConnected ? "Live Streaming" : "Connecting"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Stand in agreement with brethren around the world. Click &quot;Praying with You&quot; to intercede
            together.
          </p>
        </div>

        <Badge variant="outline" className="w-fit gap-1.5 text-xs tabular">
          <Users className="size-3.5 text-highlight" />
          <span>{prayers.reduce((sum, p) => sum + p.prayingCount, 0)} prayers offered</span>
        </Badge>
      </div>

      <div className="grid gap-4">
        {prayers.map((prayer) => {
          const isPending = pendingPrayers.has(prayer.id);

          return (
            <Card
              key={prayer.id}
              className="hover:shadow-subtle relative overflow-hidden border-border bg-surface p-5 transition-shadow"
            >
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{prayer.name}</span>
                    <span className="text-2xs text-muted-foreground">·</span>
                    <span className="text-2xs text-muted-foreground">{formatDate(prayer.createdAt)}</span>
                  </div>

                  <span className="text-2xs flex items-center gap-1 font-semibold text-highlight tabular">
                    <Flame className="size-3.5 fill-highlight/20 text-highlight" />
                    {prayer.prayingCount} praying
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-pretty text-foreground/90">{prayer.request}</p>

                <div className="flex items-center justify-between border-t border-border/40 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={prayer.hasSupported ? "outline" : "primary"}
                    disabled={prayer.hasSupported || isPending}
                    onClick={() => handleSupport(prayer.id)}
                    className="gap-2 text-xs"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Recording...
                      </>
                    ) : prayer.hasSupported ? (
                      <>
                        <Check className="size-3.5 text-success" />
                        Praying With You
                      </>
                    ) : (
                      <>
                        <HeartHandshake className="size-3.5" />
                        Pray With {prayer.name.split(" ")[0]}
                      </>
                    )}
                  </Button>

                  {prayer.hasSupported && (
                    <span className="text-2xs flex items-center gap-1 font-medium text-success">
                      <Sparkles className="size-3" /> Agreement recorded
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
