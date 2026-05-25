import { NextResponse } from "next/server";
import { runEvalSuite } from "@/lib/evals";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(runEvalSuite());
}
