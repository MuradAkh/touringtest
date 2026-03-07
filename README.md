# Touring Test

A geography guessing game where you identify cities from AI-generated clues.

**Play it live:** [touringtest.murad.dev](https://touringtest.murad.dev)

## How to Play

Each round presents you with clues about a mystery city. The clues can be:
- **Poems & Haikus** - Poetic descriptions of the city
- **Travel Blogs** - Narrative descriptions of the city's character
- **Paintings** - AI-generated artwork depicting the city
- **Fun Facts** - Interesting trivia about the city
- **Local Cuisine** - Descriptions of regional dishes
- **City Descriptions** - General information about the city

Your goal is to figure out which city the clues describe and mark your guess on an interactive map. You score points based on:
- **Speed** - Faster answers earn more points (up to 1000 points)
- **Accuracy** - Closer guesses to the actual city location earn more points (up to 1000 points)

## Game Settings

Before starting, you can customize:
- **Round Time** - How long you have per round (15-90 seconds)
- **Number of Rounds** - How many cities to guess (1-10 rounds)

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to play.

## Deployment

This project is configured to deploy to Cloudflare Pages using Wrangler.

### Prerequisites

1. Install Wrangler (included as a dev dependency):
   ```bash
   npm install
   ```

2. Authenticate with Cloudflare:
   ```bash
   npx wrangler login
   ```

### Deploy

To deploy to Cloudflare Pages:

```bash
npm run deploy
```

To deploy a preview branch:

```bash
npm run deploy:preview
```

The deployment will:
1. Build the Next.js static export
2. Deploy the `out` directory to Cloudflare Pages

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Material-UI](https://mui.com/) - UI components
- [Leaflet](https://leafletjs.com/) - Interactive maps

## Project Structure

- `pages/index.tsx` - Home page with game preview and settings
- `pages/play.tsx` - Main game view
- `src/components/` - React components (Clues, MapAnswerTab, Scoreboard, etc.)
- `src/GameContext.tsx` - Game state management and scoring logic
- `public/data/` - Game data (cities and clues)

