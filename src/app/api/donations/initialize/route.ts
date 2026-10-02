import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

export interface DonationInitBody {
  campaignId: string;
  amount: number;
  donorName?: string;
  donorEmail?: string;
  currency?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as DonationInitBody | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { campaignId, amount, donorName, donorEmail, currency = "NGN" } = body;

    if (!campaignId || typeof campaignId !== "string") {
      return NextResponse.json({ error: "A valid campaignId is required" }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a valid positive number" }, { status: 400 });
    }

    // Minimum limit check (100 NGN or equivalent)
    if (numAmount < 100 && currency === "NGN") {
      return NextResponse.json({ error: "Minimum donation amount is ₦100" }, { status: 422 });
    }

    const sessionId = `don_sess_${Date.now()}_${randomBytes(8).toString("hex")}`;

    return NextResponse.json({
      sessionId,
      checkoutUrl: `/give?session=${sessionId}&status=initialized`,
      amount: numAmount,
      currency: currency.toUpperCase(),
      campaignId,
      donorName: donorName?.trim() || "Anonymous Saint",
      donorEmail: donorEmail?.trim() || undefined,
      status: "initialized",
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
