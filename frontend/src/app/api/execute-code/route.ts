import { NextRequest, NextResponse } from "next/server";

const JDOODLE_URL = "https://api.jdoodle.com/v1/execute";
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET ?? "";

// JDoodle language + versionIndex
// Full list: https://www.jdoodle.com/compiler-api/
const LANGUAGE_CONFIG: Record<
  string,
  { language: string; versionIndex: string }
> = {
  python: { language: "python3", versionIndex: "4" },
  "c++": { language: "cpp17", versionIndex: "0" },
  r: { language: "r", versionIndex: "4" },
  sql: { language: "sql", versionIndex: "3" },
};

export async function POST(req: NextRequest) {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json(
        { error: "JDoodle credentials belum dikonfigurasi di .env.local" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const language: string = (body.language ?? "").toLowerCase().trim();
    const code: string = body.code ?? "";

    if (!language || !code.trim()) {
      return NextResponse.json(
        { error: "language dan code wajib diisi" },
        { status: 400 },
      );
    }

    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      return NextResponse.json(
        {
          error: `Bahasa "${language}" tidak didukung. Pilih: python, c++, r, sql`,
        },
        { status: 400 },
      );
    }

    const jdoodleRes = await fetch(JDOODLE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        script: code,
        language: config.language,
        versionIndex: config.versionIndex,
        stdin: "",
      }),
    });

    if (!jdoodleRes.ok) {
      const errText = await jdoodleRes.text();
      throw new Error(`JDoodle error ${jdoodleRes.status}: ${errText}`);
    }

    const result = await jdoodleRes.json();

    // JDoodle response: { output, statusCode, memory, cpuTime, isExecutionSuccess }
    // statusCode 200 = sukses, 400/429 = error
    if (result.statusCode && result.statusCode !== 200) {
      // 429 = daily limit tercapai
      if (result.statusCode === 429) {
        return NextResponse.json(
          {
            error:
              "Batas eksekusi harian tercapai (200/hari). Coba lagi besok.",
          },
          { status: 429 },
        );
      }
      throw new Error(result.output ?? `JDoodle status ${result.statusCode}`);
    }

    const output: string = result.output?.trimEnd() ?? "(no output)";

    return NextResponse.json({ output });
  } catch (err: any) {
    console.error("[execute-code] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
