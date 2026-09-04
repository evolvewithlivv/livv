/** Real quotes — one shown per app open (session). */

export type Quote = { text: string; author: string };

export const QUOTES: Quote[] = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", author: "Chinese proverb" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Fall seven times, stand up eight.", author: "Japanese proverb" },
  { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Hard choices, easy life. Easy choices, hard life.", author: "Jerzy Gregorek" },
  { text: "Motivation gets you going. Habit gets you there.", author: "Zig Ziglar" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
  { text: "Courage is resistance to fear, mastery of fear—not absence of fear.", author: "Mark Twain" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
];

const SESSION_KEY = "livv-quote-session";

/** New quote each time the app is freshly opened (new session). */
export function quoteForSession(): Quote {
  if (typeof window === "undefined") return QUOTES[0];
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      const q = JSON.parse(existing) as Quote;
      if (q?.text && q?.author) return q;
    }
  } catch {
    /* fall through */
  }
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(q));
  } catch {
    /* ignore */
  }
  return q;
}
