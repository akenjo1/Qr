import { NextResponse } from "next/server";
import { makeLocalTemplates, Template } from "@/lib/templates";

export const runtime = "nodejs";

export async function GET() {
  const local = makeLocalTemplates(100);
  const url = process.env.TEMPLATES_URL;

  if (!url) {
    return NextResponse.json({ templates: local }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error("fetch failed");
    const data = (await r.json()) as { templates?: Template[] };
    const remote = Array.isArray(data.templates) ? data.templates : [];

    const map = new Map<string, Template>();
    for (const t of local) map.set(t.id, t);
    for (const t of remote) map.set(t.id, t);

    return NextResponse.json(
      { templates: Array.from(map.values()) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ templates: local }, { headers: { "Cache-Control": "no-store" } });
  }
}
