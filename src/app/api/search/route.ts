import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (!query) return NextResponse.json({ products: [] });
  try {
    const products = await getProducts({ search: query });
    return NextResponse.json({ products: products.slice(0, 6) }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch {
    return NextResponse.json({ products: [], error: "Search is temporarily unavailable." }, { status: 503 });
  }
}
