import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { allowRequest, requestAddress } from "@/lib/server/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(60).default(""),
  message: z.string().trim().min(10).max(3000),
});

export async function POST(request: Request) {
  const address = requestAddress(request);
  if (!allowRequest(`message:${address}`, 5, 60_000)) return NextResponse.json({ message: "Please wait a moment before sending another note." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Check your contact details and message." }, { status: 400 });
  const { error } = await createSupabasePublicClient().from("messages").insert(parsed.data);
  if (error) return NextResponse.json({ message: "Your note could not be saved. Please try again." }, { status: 503 });
  return NextResponse.json({ message: "Your note has been sent." }, { status: 201 });
}
