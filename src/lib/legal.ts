export const LEGAL = {
  product: "LIVV",
  company: "Evolve With LIVV",
  email: "evolvewithlivv@gmail.com",
  effective: "September 7, 2026",
};

export type LegalDoc = {
  slug: string;
  title: string;
  blurb: string;
  sections: { h: string; p: string[] }[];
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Use",
    blurb: "The rules for using LIVV, memberships, and holding an account.",
    sections: [
      {
        h: "1. The agreement",
        p: [
          "These Terms of Use are a contract between you and Evolve With LIVV (\"we\", \"us\") for the LIVV app, website, and related services.",
          "By creating an account, opening the app, or starting a membership, you agree to these Terms and to the Privacy Policy. If you do not agree, do not use LIVV.",
          "We may update these Terms. The date at the top is the current version. Continued use after a change means you accept the new Terms.",
        ],
      },
      {
        h: "2. Who can use LIVV",
        p: [
          "You must be at least 13 years old. If you are under 18, you need a parent or guardian who agrees to these Terms on your behalf.",
          "You are responsible for your account, your username, and anything done while signed in. Keep your login details private.",
          "One person, one account unless we say otherwise in writing. Do not sell, rent, or share your account.",
        ],
      },
      {
        h: "3. What LIVV is (and is not)",
        p: [
          "LIVV is a self-improvement product. It tracks habits, training, reading, and daily check-ins. It is software, not a coach sitting next to you.",
          "LIVV is not medical advice, therapy, financial advice, legal advice, or a licensed professional service. Training pages are general fitness tools. Money pages are general education. Evala is an in-app assistant that can be wrong.",
          "You use LIVV at your own risk. Talk to a qualified professional before you change diet, training, sleep, or money in a way that could affect your health or finances.",
        ],
      },
      {
        h: "4. Your content",
        p: [
          "You keep ownership of the words, photos, and other material you put into LIVV.",
          "You give us a worldwide, non-exclusive license to host, store, display, and process that material so the product can work. That includes showing your profile inside features you choose to use and operating backups when sync exists.",
          "Do not upload anything illegal, abusive, infringing, or that you do not have rights to share.",
        ],
      },
      {
        h: "5. Embers, streaks, and levels",
        p: [
          "Embers, streaks, levels, and similar items are virtual goods. They have no cash value. You do not own them as property. You get a limited, personal, revocable license to use them inside LIVV.",
          "We can change, reset, or remove virtual goods when needed for abuse, bugs, economy balance, or product changes.",
        ],
      },
      {
        h: "6. Memberships and payments",
        p: [
          "Spark is free. Rise, Apex, and Inner Circle are paid memberships when billing is live.",
          "Prices are shown in the app or store listing before you buy. Taxes may apply. Billing is handled by Stripe, Apple, Google, or another processor we name at checkout.",
          "Subscriptions renew until you cancel. Cancel in the app, in your store account, or by emailing us before the renewal date if that path is available for your purchase.",
          "Digital memberships and virtual goods are generally not refundable once delivered, except where Apple, Google, or the law in your region requires it.",
          "If a charge fails, duplicates, or never delivers the membership, email evolvewithlivv@gmail.com with the date and the last four of the statement. Read the Refunds page for the full policy.",
        ],
      },
      {
        h: "7. Acceptable use",
        p: [
          "Do not hack, scrape, overload, or reverse engineer LIVV. Do not use bots to farm Embers or streaks.",
          "Do not harass other people, post illegal content, or use LIVV to break the law.",
          "We can suspend or terminate accounts that break these Terms, harm other users, or put the product at risk.",
        ],
      },
      {
        h: "8. Availability",
        p: [
          "We aim for uptime but do not guarantee uninterrupted service. Features can change, pause, or end.",
          "We are not liable for lost streaks, lost local data, or downtime.",
        ],
      },
      {
        h: "9. Disclaimers",
        p: [
          "LIVV is provided as is and as available. To the fullest extent allowed by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.",
          "Some places do not allow certain disclaimers. In those places, our liability is limited to the maximum the law allows.",
        ],
      },
      {
        h: "10. Limitation of liability",
        p: [
          "To the fullest extent allowed by law, Evolve With LIVV is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill.",
          "Our total liability for any claim related to LIVV is limited to the greater of (a) the amount you paid us in the 12 months before the claim or (b) fifty US dollars.",
        ],
      },
      {
        h: "11. Termination",
        p: [
          "You can stop using LIVV anytime. You can ask us to delete your account by emailing evolvewithlivv@gmail.com from the address on the account.",
          "We can suspend or end access when these Terms are broken or when the product is discontinued.",
        ],
      },
      {
        h: "12. Governing law",
        p: [
          "These Terms are governed by the laws of the United States and the state where Evolve With LIVV is organized, without conflict-of-law rules, except where mandatory consumer law in your country says otherwise.",
        ],
      },
      {
        h: "13. Contact",
        p: [
          "Questions about these Terms: evolvewithlivv@gmail.com",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    blurb: "What we collect, why we collect it, and the choices you have.",
    sections: [
      {
        h: "1. Scope",
        p: [
          "This Privacy Policy explains how Evolve With LIVV handles information when you use the LIVV app and website.",
        ],
      },
      {
        h: "2. What we collect",
        p: [
          "Account data: email, username, display name, bio, goal, and authentication records from our auth provider.",
          "Product data: streaks, levels, Embers, workouts you log, Daily answers, wiki actions, and settings.",
          "Device and technical data: approximate device type, browser, app version, crash diagnostics, and basic analytics needed to keep LIVV running.",
          "Payment data: handled by Stripe or the app store. We receive membership status and limited billing identifiers, not your full card number.",
        ],
      },
      {
        h: "3. How we use it",
        p: [
          "To run your account and sync progress across devices when that feature is on.",
          "To process memberships.",
          "To operate app features. Some features process the information you enter so the requested feature can respond. Do not type secrets you would not want a processor to see.",
          "To fix bugs, prevent abuse, and improve LIVV.",
          "To send service messages about your account. Marketing is optional and separate when it exists.",
        ],
      },
      {
        h: "4. Legal bases",
        p: [
          "Where GDPR or similar law applies, we process data to perform the contract (providing LIVV), for legitimate interests (security, product improvement), and with consent when required.",
        ],
      },
      {
        h: "5. Sharing",
        p: [
          "We use processors such as Supabase (auth and database), Stripe (payments), and hosting providers.",
          "We do not sell your personal information.",
          "We may disclose information if required by law or to protect users, our rights, or safety.",
        ],
      },
      {
        h: "6. Your choices",
        p: [
          "You can edit your profile in the app. You can sign out. You can ask us to delete your account by emailing evolvewithlivv@gmail.com from the address on the account.",
          "If you are in the EEA, UK, or a place with similar law, you can ask for access, correction, deletion, or a copy of your data, and you can object to some processing.",
          "You can turn off optional sound and haptics in Settings. Notification controls will live there when that layer ships.",
        ],
      },
      {
        h: "7. Children",
        p: [
          "LIVV is not directed at children under 13. We do not knowingly collect their data. If you think we have, email us and we will delete it.",
        ],
      },
      {
        h: "8. Security and transfers",
        p: [
          "We use standard industry protections. No app is perfectly secure. Do not store passwords or bank details inside app input fields or journal-like entries.",
          "Servers may sit in the United States. If you use LIVV from another country, you understand your data can be processed there.",
        ],
      },
      {
        h: "9. Changes",
        p: [
          "We will update this page when the policy changes. The date at the top is the current version.",
        ],
      },
      {
        h: "10. Contact",
        p: [
          "Privacy questions: evolvewithlivv@gmail.com",
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refunds",
    blurb: "How charges and memberships are handled when something goes wrong.",
    sections: [
      {
        h: "Memberships",
        p: [
          "Cancel anytime. You keep access through the period you already paid. We do not prorate a mid-cycle cancel unless the store or the law requires it.",
          "Apple and Google subscriptions must be canceled in those stores. We cannot cancel an App Store sub from our dashboard.",
        ],
      },
      {
        h: "Digital goods",
        p: [
          "Virtual goods and in-app progress have no cash value and are generally non-refundable once delivered, except where consumer law requires otherwise.",
        ],
      },
      {
        h: "How to ask",
        p: [
          "Email evolvewithlivv@gmail.com with the username, date, amount, and membership details. We aim to reply within 7 days.",
        ],
      },
    ],
  },
];

export function legalBySlug(slug: string) {
  return LEGAL_DOCS.find((d) => d.slug === slug) || null;
}
