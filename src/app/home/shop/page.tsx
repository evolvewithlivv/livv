"use client";

import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { loadIdentity } from "@/lib/identity";
import { EMBERS_PER_DOLLAR, MIN_REDEEM_EMBERS, REDEEM_RULES_COPY, embersToDollars } from "@/lib/ember-economy";
import "./shop-rack.css";

const PRODUCTS = [
  { no:"01", name:"Heavyweight Tee", variant:"White Logo", price:"$39.95", image:"https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-black-front-6ac2572409a64.png?v=1791121207", href:"/products/men-s-premium-heavyweight-tee-1" },
  { no:"02", name:"Heavyweight Tee", variant:"Black Logo", price:"$39.95", image:"https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-premium-heavyweight-tee-white-front-6ac256bda7240.png?v=1791121101", href:"/products/men-s-premium-heavyweight-tee" },
  { no:"03", name:"Heavyweight Long Sleeve", variant:"White Logo", price:"$44.95", image:"https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-black-front-6ac2573c45416.png?v=1791121222", href:"/products/mens-heavyweight-long-sleeve-t-shirt-1" },
  { no:"04", name:"Heavyweight Long Sleeve", variant:"Black Logo", price:"$44.95", image:"https://cdn.shopify.com/s/files/1/1091/3644/5726/files/mens-heavyweight-long-sleeve-t-shirt-white-front-6ac256f65cc22.png?v=1791121157", href:"/products/mens-heavyweight-long-sleeve-t-shirt" },
  { no:"05", name:"Tough iPhone Case", variant:"Collection 001", price:"$34.95", image:"https://cdn.shopify.com/s/files/1/1091/3644/5726/files/tough-case-for-iphone-matte-iphone-17-pro-max-front-6ac255eaa6549.png?v=1791120889", href:"/products/tough-case-for-iphone" },
];

export default function ShopPage() {
  const [embers, setEmbers] = useState(0);
  useEffect(() => {
    const sync = () => setEmbers(loadIdentity().embers || 0);
    sync();
    window.addEventListener("livv-identity", sync);
    return () => window.removeEventListener("livv-identity", sync);
  }, []);

  const dollars = embersToDollars(embers);
  const remaining = Math.max(0, MIN_REDEEM_EMBERS - embers);
  const progress = Math.min(100, Math.round((embers / MIN_REDEEM_EMBERS) * 100));

  return (
    <main className="shop-page">
      <div className="shop-shell">
        <header className="shop-header">
          <div className="shop-header-top"><span>SHOP</span></div>
          <div className="shop-title-block">
            <p className="shop-kicker">THE PHYSICAL LAYER</p>
            <h1>COLLECTION 001</h1>
            <p className="shop-subtitle">The first physical expression of LIVV.</p>
          </div>
        </header>

        <section className="shop-collection" aria-labelledby="collection-title">
          <div className="shop-section-head"><h2 id="collection-title">THE FIVE</h2></div>
          <div className="shop-grid">
            {PRODUCTS.map((product) => (
              <Link key={product.href} href={product.href} className="shop-product">
                <div className="shop-product-image">
                  <img src={product.image} alt={product.name + " — " + product.variant} loading={product.no === "01" ? "eager" : "lazy"} />
                  <span className="shop-product-no">{product.no}</span>
                  <span className="shop-product-open" aria-hidden="true"><ArrowUpRight size={15} strokeWidth={1.7} /></span>
                </div>
                <div className="shop-product-info">
                  <div><h3>{product.name}</h3><p>{product.variant}</p></div>
                  <strong>{product.price}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="shop-embers" aria-label="Embers balance">
          <div className="shop-embers-top">
            <div className="shop-embers-mark" aria-hidden="true"><Flame size={14} strokeWidth={1.8} /></div>
            <div>
              <p className="shop-embers-eyebrow">EMBER BALANCE</p>
              <p className="shop-embers-caption">Earned by putting the standard into practice.</p>
            </div>
            <Link href="/home/profile" className="shop-embers-open" aria-label="View Embers in profile"><ArrowUpRight size={15} /></Link>
          </div>
          <div className="shop-embers-reading">
            <strong>{embers.toLocaleString()}</strong>
            <span>EMBERS</span>
            <span className="shop-embers-value">≈ ${dollars.toFixed(2)}</span>
          </div>
          <div className="shop-embers-progress" aria-hidden="true"><span style={{ width: progress + "%" }} /></div>
          <div className="shop-embers-meta">
            <span>{remaining === 0 ? "REDEMPTION READY" : remaining.toLocaleString() + " TO REDEEM"}</span>
            <span>{MIN_REDEEM_EMBERS.toLocaleString()} EMBER MINIMUM</span>
          </div>
          <details className="shop-embers-rules">
            <summary>How Embers work</summary>
            <div><p>Embers convert at {EMBERS_PER_DOLLAR} per dollar.</p>{REDEEM_RULES_COPY.map((rule) => <p key={rule}>• {rule}</p>)}</div>
          </details>
        </section>
        <footer className="shop-footer"></footer>
      </div>
    </main>
  );
}
