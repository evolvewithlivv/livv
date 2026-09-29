import { NextResponse } from "next/server";
import { RECIPES } from "@/lib/recipes";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(
    { recipes: RECIPES, count: RECIPES.length, source: "LIVV" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
