import { NextResponse } from "next/server";

// Simple in-memory subscriber registry for dev & demonstration
const activeSubscribers = new Set<string>();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.email !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "The email address format is not recognized." },
        { status: 400 },
      );
    }

    const deliveryTime = body.deliveryTime === "vespers" ? "vespers" : "dawn";
    activeSubscribers.add(email);

    return NextResponse.json(
      {
        success: true,
        message: "You have been inscribed into the fellowship of ESOCS Daily Devotionals.",
        email,
        deliveryTime,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to process devotional subscription:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    subscriberCount: activeSubscribers.size,
    frequency: "Daily at dawn (5:30 AM West Africa Time)",
  });
}
