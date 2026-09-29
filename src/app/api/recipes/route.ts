import { NextResponse } from "next/server";
import { fetchRealRecipes } from "@/lib/recipes/themealdb";

export const revalidate = 86400; // 24h

export async function GET() {
  try {
    const recipes = await fetchRealRecipes();
    return NextResponse.json(
      { recipes, count: recipes.length, source: "TheMealDB" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (e) {
    console.error("[api/recipes]", e);
    return NextResponse.json({ recipes: [], count: 0, error: "fetch_failed" }, { status: 500 });
  }
}
