# Crayon Ladder Game

A ladder-luck game (사다리타기) with a crayon look, built with React + Vite.

**Play:** https://bakhoon.github.io/ladder-luck-game/

## How it works

1. **Ladder Game**: pick how many players (2 to 8) and how many busts.
2. **Let's Draw!**: pick a crayon and drag from one line to the next to draw rungs. Slanted is fine. Tap a rung to erase it, or hit Random.
3. **Who's the bust?**: tap a buddy at the top and watch it climb down the ladder you drew. The safe/bust results are shuffled each round.

## Develop

```bash
npm install
npm run dev
```

Pushing to `main` builds and deploys to GitHub Pages through `.github/workflows/deploy.yml`.
