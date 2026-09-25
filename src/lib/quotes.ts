/** Curated real quotations. Prefer primary/public-domain sources and retain attribution notes where wording is disputed. */

export type Quote = { text: string; author: string; source: string };

export const QUOTES: Quote[] = [
  { text: "If it is not right, do not do it; if it is not true, do not say it.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "You have power over your mind—not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "The soul is dyed by the thoughts.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "Think of yourself as dead. You have lived your life. Now take what is left and live it properly.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "First, do nothing inconsiderately, nor without a purpose.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", source: "Discourses" },
  { text: "It is not things themselves that disturb men, but their judgments about these things.", author: "Epictetus", source: "Enchiridion" },
  { text: "No great thing is created suddenly.", author: "Epictetus", source: "Discourses" },
  { text: "If you want to improve, be content to be thought foolish and stupid.", author: "Epictetus", source: "Enchiridion" },
  { text: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca", source: "Seneca's Morals" },
  { text: "It does not matter what you bear, but how you bear it.", author: "Seneca", source: "On Providence" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca", source: "Letters to Lucilius" },
  { text: "The comfort of life depends upon conversation.", author: "Seneca", source: "Seneca's Morals" },
  { text: "The reward of a thing well done is to have done it.", author: "Ralph Waldo Emerson", source: "Essays and Lectures" },
  { text: "Nothing can bring you peace but yourself.", author: "Ralph Waldo Emerson", source: "Self-Reliance and Other Essays" },
  { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson", source: "Essays and Lectures" },
  { text: "Concentration is the secret of strength.", author: "Ralph Waldo Emerson", source: "Attributed saying" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau", source: "Walden" },
  { text: "Simplify, simplify.", author: "Henry David Thoreau", source: "Walden" },
  { text: "How vain it is to sit down to write when you have not stood up to live.", author: "Henry David Thoreau", source: "Journal" },
  { text: "The mass of men lead lives of quiet desperation.", author: "Henry David Thoreau", source: "Walden" },
  { text: "If there is no struggle, there is no progress.", author: "Frederick Douglass", source: "West India Emancipation speech, 1857" },
  { text: "Power concedes nothing without a demand.", author: "Frederick Douglass", source: "West India Emancipation speech, 1857" },
  { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass", source: "Speech attribution" },
  { text: "A man is rich in proportion to the number of things which he can afford to let alone.", author: "Henry David Thoreau", source: "Walden" },
  { text: "The price of anything is the amount of life you exchange for it.", author: "Henry David Thoreau", source: "Walden" },
  { text: "The universe is change: life is opinion.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "Nothing happens to any man which he is not formed by nature to bear.", author: "Marcus Aurelius", source: "Meditations" },
  { text: "If a thing is in your own power, why do you do it?", author: "Marcus Aurelius", source: "Meditations" },
  { text: "Make your acts refer to nothing else than a social end.", author: "Marcus Aurelius", source: "Meditations" },
];

let lastIndex = -1;

export function quoteForSession(): Quote {
  if (typeof window === "undefined") return QUOTES[0];
  const key = "livv-quote-index-v2";
  let previous = lastIndex;
  try {
    const stored = Number(window.localStorage.getItem(key));
    if (Number.isInteger(stored)) previous = stored;
  } catch {}
  let next = Math.floor(Math.random() * QUOTES.length);
  if (QUOTES.length > 1 && next === previous) next = (next + 1) % QUOTES.length;
  lastIndex = next;
  try { window.localStorage.setItem(key, String(next)); } catch {}
  return QUOTES[next];
}
