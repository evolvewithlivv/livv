import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3 } from "lucide-react";
import { LivvMark } from "@/components/brand/livv-mark";
import { RECIPES } from "@/lib/recipes-data";
import { PageHeader } from "@/components/layout/page-header";
import "../../public-share.css";

export function generateStaticParams() { return RECIPES.map((recipe) => ({ slug: recipe.id })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const recipe = RECIPES.find((item) => item.id === slug);
 return { title: recipe ? `${recipe.title} · LIVV Recipe` : "Recipe · LIVV", description: recipe?.blurb, robots: { index: true, follow: true } };
}
export default async function PublicRecipe({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const recipe = RECIPES.find((item) => item.id === slug); if (!recipe) notFound();
 return <main className="public-share"><article className="public-share-inner"><div className="public-brand"><LivvMark kind="wordmark" alt="LIVV" priority/><span className="public-brand-label">Recipe</span></div><PageHeader eyebrow="Recipe"><h1>{recipe.title}</h1><p className="public-lede">{recipe.blurb}</p></PageHeader><div className="public-meta"><span>{recipe.category}</span><span><Clock3 size={13} style={{display:"inline",verticalAlign:"-2px"}}/> {recipe.time} min</span><span>{recipe.servings}</span><span>{recipe.tag}</span></div>
 <section className="public-section"><p className="public-eyebrow" style={{marginTop:0}}>01 / Prepare</p><h2>Ingredients</h2><ul>{recipe.ingredients.map(x=><li key={x}>{x}</li>)}</ul></section>
 <section className="public-section"><p className="public-eyebrow" style={{marginTop:0}}>02 / Make it</p><h2>Method</h2>{recipe.steps.map((x,i)=><div className="public-step" data-step={String(i+1).padStart(2,"0")} key={x}><h3>Step {i+1}</h3><p>{x}</p></div>)}{recipe.tip&&<><h3>Useful tip</h3><p>{recipe.tip}</p></>}</section>
 {recipe.sourceUrl&&<section className="public-section"><h2>Recipe source</h2><p><a href={recipe.sourceUrl} target="_blank" rel="noreferrer" style={{color:"inherit"}}>{recipe.source||"Original source"}</a></p></section>}
 <section className="public-cta"><h2>Make everyday capability a habit.</h2><p>Explore LIVV for practical ways to build a healthier, more capable life.</p><Link href="/auth?mode=signup&src=shared_recipe">Explore LIVV</Link></section><footer className="public-foot">LIVV · Evolve with purpose</footer></article></main>;
}
