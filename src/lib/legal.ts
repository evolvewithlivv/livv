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
    blurb: "The rules for using LIVV, buying packs, and holding an account.",
    sections: [
      {
        h: "1. The agreement",
        p: [
          "These Terms of Use are a contract between you and Evolve With LIVV (\"we\", \"us\") for the LIVV app, website, and related services.",
          "By creating an account, opening the app, buying a pack, or starting a membership, you agree to these Terms and to the Privacy Policy. If you do not agree, do not use LIVV.",
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
          "LIVV is a self-improvement product. It tracks habits, training, reading, social check-ins, and a collectible pack layer. It is software, not a coach sitting next to you.",
          "LIVV is not medical advice, therapy, financial advice, legal advice, or a licensed professional service. Training pages are general fitness tools. Money pages are general education. Evala is an in-app assistant that can be wrong.",
          "You use LIVV at your own risk. Talk to a qualified professional before you change diet, training, sleep, or money in a way that could affect your health or finances.",
        ],
      },
      {
        h: "4. Your content",
        p: [
          "You keep ownership of the words, photos, and other material you put into LIVV.",
          "You give us a worldwide, non-exclusive license to host, store, display, and process that material so the product can work. That includes showing your profile to people you connect with and operating backups when sync exists.",
          "Do not post anything illegal, hateful, sexual involving minors, or that you do not have the right to share. We can remove content and close accounts that break this.",
        ],
      },
      {
        h: "5. Packs, cards, and Embers",
        p: [
          "Packs, cards, Embers, streaks, levels, and similar items are virtual goods. They have no cash value. You do not own them as property. You get a limited, personal, revocable license to use them inside LIVV.",
          "Virtual goods cannot be sold, traded outside the product, or cashed out unless we launch an official feature that says you can.",
          "Odds, drop rates, and catalog contents can change. Past pulls do not promise future pulls.",
        ],
      },
      {
        h: "6. Memberships and payments",
        p: [
          "Spark is free. Rise, Apex, and Inner Circle are paid memberships when billing is live. Packs can also be sold as one-time purchases.",
          "Payments run through Stripe or the store you bought from (Apple or Google). Their terms apply to the charge itself.",
          "Memberships renew until you cancel. Cancel in the app, in Stripe Customer Portal, or in your Apple or Google subscription settings before the next renewal if you do not want to be charged again.",
          "Prices can change. We will show the price before you pay. Taxes may be added where the law requires it.",
        ],
      },
      {
        h: "7. Refunds",
        p: [
          "Digital goods and opened packs are generally not refundable once delivered, except where Apple, Google, or the law in your region requires it.",
          "If a charge fails, duplicates, or never delivers the pack or membership, email evolvewithlivv@gmail.com with the date and the last four of the statement. Read the Refunds page for the full policy.",
        ],
      },
      {
        h: "8. Acceptable use",
        p: [
          "Do not hack, scrape, overload, or reverse engineer LIVV. Do not use bots to farm Embers, packs, or streaks.",
          "Do not harass other users. Do not impersonate LIVV or another person.",
          "We can suspend or delete an account that breaks these rules. We do not have to give a warning first if the harm is serious.",
        ],
      },
      {
        h: "9. The product will change",
        p: [
          "LIVV is early. Features can launch, move, or shut down. Data stored only on your device can be lost if you clear the app or switch phones before sync is live.",
          "We are not liable for lost streaks, lost packs, lost local data, or downtime.",
        ],
      },
      {
        h: "10. Disclaimers and limits",
        p: [
          "LIVV is provided as is. We do not promise it will be error free, always online, or that it will make you fitter, richer, or happier.",
          "To the fullest extent the law allows, we are not liable for indirect, incidental, or consequential damages. Our total liability for a claim is limited to the amount you paid us in the 12 months before the claim, or $50 if you paid nothing.",
          "Some places do not allow these limits. In those places, the limit is the maximum the law allows.",
        ],
      },
      {
        h: "11. Law",
        p: [
          "These Terms are governed by the laws of the United States and the State of Pennsylvania, without regard to conflict of law rules, unless a mandatory consumer law in your country says otherwise.",
          "If a court finds one section unenforceable, the rest still stands.",
        ],
      },
      {
        h: "12. Contact",
        p: [
          "Questions about these Terms: evolvewithlivv@gmail.com",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    blurb: "What we collect, why we collect it, and what you can ask us to do.",
    sections: [
      {
        h: "1. The short version",
        p: [
          "LIVV is built to help you evolve. We collect only what we need to run the product, take payment, and keep the app safe.",
          "On the current version, a lot of your activity stays on your device in local storage. When cloud sync and accounts go fully live, more of that data will sit on our servers. This policy covers both.",
        ],
      },
      {
        h: "2. Information we collect",
        p: [
          "Account: display name, username, photo you upload, login provider, and contact email if you give one.",
          "Product data: streaks, levels, Embers, workouts you log, Daily answers, wiki actions, pack inventory, messages you send in Connect, and settings.",
          "Payments: handled by Stripe, Apple, or Google. We receive confirmation that you paid, the product you bought, and a customer id. We do not store full card numbers.",
          "Device and usage: app version, basic device type, crash logs, and pages you open, if analytics is turned on.",
          "Support: whatever you email us.",
        ],
      },
      {
        h: "3. How we use it",
        p: [
          "To run your account and show your record back to you.",
          "To process memberships and pack purchases.",
          "To operate Evala. When Evala is connected to a model provider, we send the question you typed plus a small snapshot of your record (level, streak, open tasks, last workout). Do not type secrets you would not want a processor to see.",
          "To fix bugs, prevent abuse, and improve the product.",
          "To send service messages about billing or security. Marketing email only if you opt in.",
        ],
      },
      {
        h: "4. Who we share with",
        p: [
          "Processors who help us run LIVV: hosting (Vercel), payments (Stripe, Apple, Google), and model providers for Evala (for example xAI or OpenAI) when that layer is on.",
          "Other users, only what you choose to show on your profile or send in messages.",
          "The law, if we are required to, or to protect people from serious harm.",
          "We do not sell your personal information.",
        ],
      },
      {
        h: "5. How long we keep it",
        p: [
          "Account and product data last as long as the account is open, plus a short period after deletion for backups and legal holds.",
          "Payment records are kept as long as tax and accounting rules require.",
          "Local-only data disappears if you delete the app or clear site data before sync exists. We cannot recover that.",
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
          "We use standard industry protections. No app is perfectly secure. Do not store passwords or bank details inside Daily answers or Evala chats.",
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
    slug: "community",
    title: "Community Guidelines",
    blurb: "How people are expected to treat each other inside LIVV.",
    sections: [
      {
        h: "Be specific, not cruel",
        p: [
          "Challenge people. Do not degrade them. Jokes that punch down, slurs, and pile-ons are out.",
        ],
      },
      {
        h: "No harassment",
        p: [
          "Do not stalk, threaten, sexualize, or flood someone who asked you to stop. One clear no is enough.",
        ],
      },
      {
        h: "No illegal or dangerous content",
        p: [
          "Do not share content that exploits minors, glorifies self-harm as instruction, or sells illegal activity. Fitness talk is fine. Coaching someone into an eating disorder is not.",
        ],
      },
      {
        h: "No spam or farms",
        p: [
          "Do not run bots, fake streaks, or pack farms. Do not drop links in every chat.",
        ],
      },
      {
        h: "Own your face",
        p: [
          "Do not impersonate LIVV staff or another member. Photo and name should be you, or clearly a character, not a stolen identity.",
        ],
      },
      {
        h: "What we do",
        p: [
          "We can hide content, mute, or close an account. Report a problem to evolvewithlivv@gmail.com with screenshots if you have them.",
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refunds",
    blurb: "How charges, memberships, and packs are handled when something goes wrong.",
    sections: [
      {
        h: "Memberships",
        p: [
          "Cancel anytime. You keep access through the period you already paid. We do not prorate a mid-cycle cancel unless the store or the law requires it.",
          "Apple and Google subscriptions must be canceled in those stores. We cannot cancel an App Store sub from our dashboard.",
        ],
      },
      {
        h: "Packs",
        p: [
          "An unopened pack that never arrived because of a failed grant can be replaced or refunded. Email us.",
          "Once you open a pack, that purchase is final, except where consumer law in your country says otherwise.",
        ],
      },
      {
        h: "How to ask",
        p: [
          "Email evolvewithlivv@gmail.com with the username, date, amount, and whether it was a pack or a membership. We aim to reply within 7 days.",
        ],
      },
    ],
  },
];

export function legalBySlug(slug: string) {
  return LEGAL_DOCS.find((d) => d.slug === slug) || null;
}
