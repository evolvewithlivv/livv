import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { AmbientField } from "@/components/layout/ambient-field";

const SHOP_URL = "https://n8tv6p-pu.myshopify.com";

const PRODUCTS = [
  {
    name: "Essential Long Sleeve Tee",
    subtitle: "Black / White Logo",
    price: "$44.99",
    image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-long-sleeve-tee-black-heather-front-6a9eead841a4c.png?v=1788799728",
    href: `${SHOP_URL}/products/livv-essential-long-sleeve-tee-1`,
  },
  {
    name: "Essential Long Sleeve Tee",
    subtitle: "White / Black Logo",
    price: "$44.99",
    image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-long-sleeve-tee-white-front-6aee93df3eae.png?v=1788799311",
    href: `${SHOP_URL}/products/livv-essential-long-sleeve-tee`,
  },
];

export default function ShopPage() {
  return (
    <main className="relative min-h-full overflow-hidden bg-[#050505] pb-12 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-12rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,159,67,.16) 0%, transparent 64%)" }}
        />
        <AmbientField intensity="strong" />
        <div className="livv-grain opacity-[0.045]" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl px-5 pt-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-[#ff9f43]">LIVV Shop</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.05em]">Wear the evolution.</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ff9f43]/20 bg-[#ff9f43]/[0.08] text-[#ff9f43] shadow-[0_0_28px_rgba(255,159,67,.12)]">
            <ShoppingBag size={21} strokeWidth={1.9} />
          </div>
        </header>

        <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-white/45">
          Physical pieces from the LIVV world. Start simple. Build a uniform for the person you are becoming.
        </p>

        <section className="mt-8 grid grid-cols-2 gap-3">
          {PRODUCTS.map((product) => (
            <a
              key={product.href}
              href={product.href}
              className="group overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl transition duration-300 active:scale-[0.98]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.035]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={`${product.name} — ${product.subtitle}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050505] to-transparent" />
              </div>
              <div className="p-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#ff9f43]">Essential</p>
                <h2 className="mt-1 text-[14px] font-semibold leading-tight">{product.name}</h2>
                <p className="mt-1 text-[11px] text-white/40">{product.subtitle}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[13px] font-semibold">{product.price}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/60 transition group-hover:border-[#ff9f43]/30 group-hover:text-[#ff9f43]">
                    <ArrowUpRight size={15} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </section>

        <Link
          href={SHOP_URL}
          className="mt-5 flex items-center justify-between rounded-[28px] border border-[#ff9f43]/20 bg-[#ff9f43]/[0.07] px-5 py-4 transition active:scale-[0.99]"
        >
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#ff9f43]">Full storefront</p>
            <p className="mt-1 text-[13px] font-medium text-white/75">Open LIVV Shop</p>
          </div>
          <ArrowUpRight size={18} className="text-[#ff9f43]" />
        </Link>

        <p className="mt-6 text-center text-[9px] uppercase tracking-[0.22em] text-white/20">
          Built to evolve with you
        </p>
      </div>
    </main>
  );
}
