export const EVOLUTION_TITLES: { min: number; name: string; line: string }[] = [
  { min: 1, name: "Beginning", line: "You opened the door. Most people never do." },
  { min: 2, name: "Awakening", line: "You are noticing the gap between who you are and who you want." },
  { min: 3, name: "Momentum", line: "You are no longer starting. The work is consistency." },
  { min: 5, name: "Discipline", line: "Showing up stopped being a decision. It is a standard." },
  { min: 8, name: "Capability", line: "You can carry more than you used to. Prove it quietly." },
  { min: 12, name: "Expansion", line: "Growth is spreading across more of your life." },
  { min: 18, name: "Mastery", line: "The work compounds. Protect it." },
];

export function evolutionTitle(level: number) {
  let current = EVOLUTION_TITLES[0];
  for (const t of EVOLUTION_TITLES) {
    if (level >= t.min) current = t;
  }
  return current;
}
