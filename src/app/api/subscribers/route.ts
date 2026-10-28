import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { allowRequest, requestAddress } from "@/lib/server/rate-limit";

const schema = z.object({ email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()) });

export async function POST(request: Request) {
  const address = requestAddress(request);
  if (!allowRequest(`subscribe:${address}`, 5, 60_000)) return NextResponse.json({ message: "Please wait a moment before trying again." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  const { error } = await createSupabasePublicClient().from("subscribers").insert({ email: parsed.data.email });
  if (error && error.code !== "23505") return NextResponse.json({ message: "We could not save your email just now. Please try again." }, { status: 503 });
  return NextResponse.json({ message: "You are on the list." }, { status: 201 });
}
