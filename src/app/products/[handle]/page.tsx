"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getProduct,
  shopifyProductUrl,
  type ShopProduct,
} from "@/lib/shop-catalog";

export default function ProductDetailPage() {
  const params = useParams();
  const handle = String(params?.handle ?? "");
  const product = useMemo(() => getProduct(handle), [handle]);

  if (!product) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-livv-bg px-6 text-livv-ink">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
          LIVV
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Product not found</h1>
        <Link
          href="/home/shop"
          className="mt-8 rounded-full bg-livv-ink px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-livv-bg"
        >
          Back to shop
        </Link>
      </main>
    );
  }

  return <ProductView product={product} />;
}

function ProductView({ product }: { product: ShopProduct }) {
  const initial: Record<string, string> = {};
  for (const opt of product.options) {
    initial[opt.name] = opt.values[0]?.id ?? "";
  }
  const [selected, setSelected] = useState<Record<string, string>>(initial);
  const checkoutUrl = shopifyProductUrl(product.handle);

  return (
    <main className="min-h-[100dvh] bg-livv-bg text-livv-ink">
      <div className="mx-auto w-full max-w-lg px-5 pb-16 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/home/shop"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-livv-border px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-livv-muted transition hover:text-livv-ink"
          >
            <ArrowLeft size={14} />
            Shop
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">
            Collection 001
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2%,transparent)]">
          <div className="aspect-[4/5] w-full">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            LIVV
          </p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-[18px] font-semibold">{product.price}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-livv-muted">
            {product.description}
          </p>
        </div>

        {product.options.map((opt) => (
          <div key={opt.name} className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
                {opt.name}
              </p>
              <p className="text-[12px] font-medium text-livv-ink">
                {opt.values.find((v) => v.id === selected[opt.name])?.label}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {opt.values.map((v) => {
                const on = selected[opt.name] === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() =>
                      setSelected((s) => ({ ...s, [opt.name]: v.id }))
                    }
                    className={
                      "min-w-[3rem] rounded-full border px-3.5 py-2.5 text-[13px] font-semibold transition " +
                      (on
                        ? "border-livv-ink bg-livv-ink text-livv-bg"
                        : "border-livv-border bg-transparent text-livv-ink hover:border-livv-ink/40")
                    }
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-10 space-y-3">
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-14 w-full items-center justify-center rounded-full bg-livv-ink text-[12px] font-extrabold uppercase tracking-[0.16em] text-livv-bg transition active:scale-[0.99]"
          >
            Buy now
          </a>
          <p className="text-center text-[12px] leading-relaxed text-livv-muted">
            Secure checkout on the LIVV store. Confirm size and model before
            paying.
          </p>
        </div>
      </div>
    </main>
  );
}
