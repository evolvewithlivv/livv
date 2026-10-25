# Hallmark in LIVV

Hallmark (github.com/Nutlope/hallmark, MIT) is a design skill for coding agents: Claude Code, Cursor, Codex, OpenCode. It is not a dependency of the app and nothing in it ships to users. It lints and rebuilds UI against a set of rules aimed at generic AI-looking design.

`design.md` at the repo root locks LIVV's system. Hallmark reads it first, so it works inside LIVV's brand instead of dealing a new theme.

## Install (once, on your own machine)

Needs Node 18+.

```
npx skills add nutlope/hallmark
```

Leave off `-g` to install into this project only. For the browser checks also run `npm i -g puppeteer-core` and have Chrome installed. Without them the static checks still run.

Claude Code plugin route instead: `/plugin marketplace add nutlope/hallmark`, then `/plugin install hallmark@hallmark`.

## Use it in this order

1. Read-only audit first. It changes nothing.
   ```
   /hallmark audit ./src/app
   ```
2. Fix only what the audit names, at the lightest depth:
   - say "polish" to fix only the tells, contrast, states and motion
   - say "restyle" or "keep the layout" to change colour, type and controls only
3. A full redesign only after you have seen the file-level plan. Hallmark keeps content and wiring, but LIVV has intentional choices that must survive (see Keep in `design.md`).
4. After any run: `npm run typecheck`, `npm run shipping:audit`, `npm run build`, then review the diff.

Hallmark only runs on an existing design when you name it. Ordinary edits stay ordinary.

## Notes

- Hallmark writes a `.hallmark/` folder (screenshots, before and after records). Check that it is not committed.
- Its Floor is strict and not waivable by the run itself. It bans tracked-capital labels, eyebrows above headings, middle-dot meta strings and a few other patterns. If the audit flags something LIVV does on purpose, decide it in `design.md` under `## Variants` instead of letting a run strip it.
- Audit findings are inputs, not verdicts. Verify each against the current repo before acting, like any other agent's audit.
