import type { CSSProperties } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonScreen } from "@/components/motion/skeleton";
import "@/app/home/home-signal.css";
import "@/app/home/daily/daily.css";
import "@/app/home/train/train.css";
import "@/app/home/health/health-signal.css";
import "@/app/home/shop/shop-rack.css";
import "@/app/home/profile/profile-signal.css";

function Bars({ count, className, style }: { count: number; className: string; style?: CSSProperties }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={className} style={style} />
      ))}
    </>
  );
}

export function HomeRouteSkeleton() {
  return (
    <main className="ho" aria-busy="true" aria-label="Loading home">
      <div className="ho-shell">
        <header className="ho-top" style={{ minHeight: 44 }}>
          <span className="livv-skel livv-skel-k" />
          <span className="livv-skel" style={{ width: "4.5rem", height: "1.75rem", borderRadius: "999px" }} />
        </header>
        <section className="ho-today">
          <span className="livv-skel livv-skel-k" />
          <span className="livv-skel" style={{ width: "68%", height: "2.85rem", marginTop: "0.2rem" }} />
          <span className="livv-skel livv-skel-line is-short" />
          <span className="livv-skel" style={{ height: "3.15rem", marginTop: "1.25rem", borderRadius: "14px" }} />
        </section>
        <section className="ho-systems" aria-hidden="true">
          <span className="livv-skel livv-skel-k" />
          <div className="ho-system-grid" style={{ marginTop: "0.7rem" }}>
            <Bars count={4} className="livv-skel" style={{ minHeight: 112, borderRadius: 18 }} />
          </div>
        </section>
      </div>
    </main>
  );
}

export function DailyRouteSkeleton() {
  return (
    <main className="dy" aria-busy="true" aria-label="Loading daily">
      <div className="dy-inner">
        <PageHeader eyebrow="Daily">
          <p className="dy-date" style={{ minHeight: "16.5px" }}><span className="livv-skel livv-skel-k" /></p>
          <span className="dy-question livv-skel" style={{ display: "block", width: "18ch", minHeight: "calc(0.98em * 2)" }} />
          <span className="livv-skel" style={{ height: "5px", marginTop: "1.25rem", borderRadius: "999px" }} />
        </PageHeader>
        <section className="dy-section" aria-hidden="true">
          <span className="livv-skel livv-skel-k" />
          <Bars count={3} className="dy-action livv-skel" style={{ minHeight: "4.75rem" }} />
        </section>
      </div>
    </main>
  );
}

export function TrainRouteSkeleton() {
  return (
    <main className="tr" aria-busy="true" aria-label="Loading train">
      <div className="tr-inner">
        <PageHeader eyebrow="Train">
          <h1 className="tr-title">Build the session.</h1>
          <p className="tr-sub">Pick split, place, and time. Then execute.</p>
        </PageHeader>
        <section className="tr-section" aria-hidden="true">
          <span className="livv-skel livv-skel-k" />
          <div className="tr-day-list">
            <Bars count={6} className="tr-day-row livv-skel" style={{ minHeight: "2.75rem" }} />
          </div>
        </section>
      </div>
    </main>
  );
}

export function HealthRouteSkeleton() {
  return (
    <main className="health-home" aria-busy="true" aria-label="Loading health">
      <div className="health-shell">
        <PageHeader eyebrow="Health" />
        <section className="health-hero" aria-hidden="true">
          <span className="livv-skel livv-skel-k" />
          <span className="livv-skel" style={{ width: "16ch", height: "clamp(2rem, 8vw, 3rem)", marginTop: "0.55rem" }} />
          <span className="livv-skel" style={{ width: "12ch", height: "clamp(2rem, 8vw, 3rem)", marginTop: "0.15rem" }} />
          <span className="livv-skel livv-skel-line" />
          <span className="livv-skel livv-skel-line is-short" />
          <span className="livv-skel" style={{ height: "5px", marginTop: "1.2rem", borderRadius: "999px" }} />
        </section>
        <section className="health-baseline" aria-hidden="true">
          <div className="health-metrics">
            <Bars count={4} className="health-metric livv-skel" style={{ minHeight: 150 }} />
          </div>
        </section>
      </div>
    </main>
  );
}

export function ShopRouteSkeleton() {
  return (
    <main className="shop-page" aria-busy="true" aria-label="Loading shop">
      <div className="shop-shell">
        <PageHeader className="shop-header" eyebrow="Shop">
          <div className="shop-title-block">
            <span className="livv-skel" style={{ width: "70%", height: "clamp(2.35rem, 10vw, 4.5rem)" }} />
            <span className="livv-skel livv-skel-line is-short" style={{ marginTop: "10px" }} />
          </div>
        </PageHeader>
        <section className="shop-collection" aria-hidden="true">
          <div className="shop-grid">
            <Bars count={4} className="livv-skel" style={{ aspectRatio: "1 / 1.12", borderRadius: 0 }} />
          </div>
        </section>
      </div>
    </main>
  );
}

export function YouRouteSkeleton() {
  return (
    <main className="you" aria-busy="true" aria-label="Loading you">
      <div className="you-inner">
        <PageHeader
          eyebrow="You"
          trailing={<span className="you-icon" style={{ width: 44, height: 44 }} aria-hidden="true" />}
        />
        <section className="you-id" aria-hidden="true">
          <span className="you-photo-wrap livv-skel" style={{ display: "block" }} />
          <span className="livv-skel" style={{ width: "8rem", height: "2.25rem", margin: "1rem auto 0" }} />
          <span className="livv-skel livv-skel-line is-short" style={{ marginLeft: "auto", marginRight: "auto" }} />
        </section>
        <section className="you-section" aria-hidden="true">
          <span className="livv-skel livv-skel-k" />
          <div className="you-record">
            <Bars count={3} className="livv-skel" style={{ height: "1.85rem" }} />
          </div>
        </section>
      </div>
    </main>
  );
}

const TAB_SKELETONS: Record<string, () => ReturnType<typeof HomeRouteSkeleton>> = {
  "/home": HomeRouteSkeleton,
  "/home/daily": DailyRouteSkeleton,
  "/home/train": TrainRouteSkeleton,
  "/home/health": HealthRouteSkeleton,
  "/home/shop": ShopRouteSkeleton,
  "/home/profile": YouRouteSkeleton,
};

export function RouteSkeleton({ pathname }: { pathname: string }) {
  const Skeleton = TAB_SKELETONS[pathname];
  if (!Skeleton) return <SkeletonScreen label="Loading" />;
  return <Skeleton />;
}
