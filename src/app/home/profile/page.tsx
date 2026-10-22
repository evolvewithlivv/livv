"use client";

import Link from "next/link";
import { ChevronRight, Settings2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { loadIdentity, type Identity } from "@/lib/identity";
import { goalLabels, loadOnboardingDraft, type OnboardingDraft } from "@/lib/onboarding";
import { loadRecord } from "@/lib/record";
import { countCompletedObjectives } from "@/lib/daily";
import { MIN_REDEEM_EMBERS, embersToDollars } from "@/lib/ember-economy";
import { PageHeader } from "@/components/layout/page-header";
import { CountUp } from "@/components/motion/count-up";
import { YouRouteSkeleton } from "@/components/motion/route-skeletons";
import "./profile-signal.css";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<ReturnType<typeof loadRecord> | null>(null);
  const [todayDone, setTodayDone] = useState(0);
  const [intent, setIntent] = useState<OnboardingDraft | null>(null);

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setRec(loadRecord());
      setTodayDone(countCompletedObjectives());
      setIntent(loadOnboardingDraft());
    };
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-record", sync);
    window.addEventListener("livv-daily", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-record", sync);
      window.removeEventListener("livv-daily", sync);
    };
  }, []);

  if (!me || !rec) return <YouRouteSkeleton />;

  const name = (me.displayName || "").trim() || "LIVV";
  const handle = me.username
    ? "@" + me.username.replace(/^@/, "")
    : null;
  const embers = me.embers || 0;
  const dollars = embersToDollars(embers);
  const initial = (name[0] || "L").toUpperCase();
  const why = intent?.why.trim() || "";
  const goals = goalLabels(intent?.goals || []);
  const interests = (intent?.interests || []).map((item) => item.trim()).filter(Boolean);
  const hasIntent = Boolean(why || goals.length || interests.length);

  return (
    <main className="you" aria-label="You">
      <div className="you-inner">
        <PageHeader
          eyebrow="You"
          trailing={
            <Link href="/home/settings" className="you-icon" aria-label="Settings">
              <Settings2 size={18} strokeWidth={1.7} />
            </Link>
          }
        />

        <section className="you-id">
          <div className="you-photo-wrap" aria-hidden>
            {me.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.photo} alt="" />
            ) : (
              <div className="you-photo-fallback">{initial}</div>
            )}
          </div>
          <h1 className="you-name">{name}</h1>
          {handle ? <p className="you-handle">{handle}</p> : null}
          {me.bio ? (
            <p className="you-bio">{me.bio}</p>
          ) : (
            <p className="you-bio">Add a short line about who you are becoming.</p>
          )}
          <Link href="/home/profile/edit" className="you-edit">
            Edit profile
          </Link>
        </section>

        {hasIntent ? (
          <section className="you-section" aria-label="Onboarding">
            <p className="you-section-k">Onboarding</p>
            {why ? <p className="you-link-t">{why}</p> : null}
            {goals.length ? <p className="you-link-s">Goals · {goals.join(" · ")}</p> : null}
            {interests.length ? <p className="you-link-s">Interests · {interests.join(" · ")}</p> : null}
          </section>
        ) : null}

        <section className="you-section" aria-label="Your record">
          <p className="you-section-k">Your record</p>
          <div className="you-record">
            <div>
              <strong className="you-record-num"><CountUp value={rec.streak || 0} /></strong>
              <span>Day streak</span>
            </div>
            <div>
              <strong className="you-record-num">{rec.workoutsCompleted || 0}</strong>
              <span>Sessions</span>
            </div>
            <div>
              <strong className="you-record-num">{todayDone}</strong>
              <span>Today</span>
            </div>
          </div>
        </section>

        <section className="you-section" aria-label="Account">
          <p className="you-section-k">Account</p>
          <div className="you-account-grid">
            <Link href="/home/profile/embers" className="you-link">
              <div>
                <p className="you-link-t">Embers</p>
                <p className="you-link-s">
                  {dollars > 0
                    ? `≈ ${dollars.toFixed(2)} toward Collection 001`
                    : `${MIN_REDEEM_EMBERS.toLocaleString()} to unlock redemption`}
                </p>
              </div>
              <span className="you-link-v"><CountUp value={embers} /></span>
            </Link>
            <Link href="/home/settings" className="you-link">
              <div>
                <p className="you-link-t">Settings</p>
                <p className="you-link-s">Appearance, data, sign out</p>
              </div>
              <ChevronRight size={18} className="you-chev" />
            </Link>
          </div>
        </section>

        <section className="you-section" aria-label="Crew">
          <p className="you-section-k">Your circle</p>
          <Link href="/home/crew" className="you-social">
            <span className="you-social-mark">
              <Users size={18} />
            </span>
            <span>
              <strong>Crew</strong>
              <small>Grow together. Share. Support each other.</small>
            </span>
            <ChevronRight size={17} className="you-chev" />
          </Link>
        </section>

        <section className="you-section" aria-label="Stay connected">
          <p className="you-section-k">Stay connected</p>
          <a
            className="you-social"
            href="https://x.com/ewl_official"
            target="_blank"
            rel="noreferrer"
          >
            <span className="you-social-mark">𝕏</span>
            <span>
              <strong>@ewl_official</strong>
              <small>Official LIVV on X</small>
            </span>
            <ChevronRight size={17} className="you-chev" />
          </a>
        </section>
      </div>
    </main>
  );
}
