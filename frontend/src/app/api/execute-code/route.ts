// app/api/execute-code/route.ts
import { NextRequest, NextResponse } from "next/server";

const CODE_RUNNER_URL = process.env.CODE_RUNNER_URL || "http://localhost:2000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const language: string = (body.language ?? "").toLowerCase().trim();
    const code: string = body.code ?? "";

    if (!language || !code.trim()) {
      return NextResponse.json(
        { error: "Language and code are required" },
        { status: 400 },
      );
    }

    // Kirim ke Code Runner di VPS
    const response = await fetch(`${CODE_RUNNER_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ language, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Execution failed" },
        { status: response.status },
      );
    }

    return NextResponse.json({
      output: data.output || "(no output)",
    });
  } catch (err: any) {
    console.error("[execute-code] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// Optional: GET endpoint untuk health check
export async function GET() {
  try {
    const response = await fetch(`${CODE_RUNNER_URL}/health`);
    const data = await response.json();
    return NextResponse.json({ status: "ok", codeRunner: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Code Runner tidak dapat dihubungi" },
      { status: 503 },
    );
  }
}
