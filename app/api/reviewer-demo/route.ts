import { NextResponse } from "next/server";
import { createReviewerDemo } from "@/lib/reviewerDemo";

export const runtime = "nodejs";

export async function POST() {
  try {
    return NextResponse.json(createReviewerDemo(), {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The reviewer demo could not run.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
