# TierCraft: Modern Local-First Tier List Maker

> **Live Application:** [https://samshady.github.io/tier-builder/](https://samshady.github.io/tier-builder/)  
> **Source Repository:** [https://github.com/samshady/tier-builder](https://github.com/samshady/tier-builder)

A fast, tactile, client-side tier list maker designed for modern web browsers and hosted on GitHub Pages. Built with Vite, React, TypeScript, Tailwind CSS, and `@dnd-kit`.


## Key Features

- **Local-First & Private**: Powered by IndexedDB (via Dexie.js). Images and boards are stored directly in your browser. No accounts, no data harvesting, no cloud servers.
- **Dual Item Types**: Rank both uploaded images (with automatic client-side WebP compression) and custom text cards with tags and accent colors.
- **1v1 Gauntlet Mode**: Binary comparison ranking ("Which is better?") to automatically position and distribute unranked items across tiers.
- **2x Retina PNG Export**: Crisp screenshot export using `html-to-image` without blurry watermarks.
- **Compressed URL State Sharing**: Share templates or finished lists via compact URL hash links powered by `lz-string`.
- **Saved Boards & Templates**: Switch between multiple saved boards or jump straight into starter templates (Programming Languages, Blank Canvas).
- **Mobile & Touch Friendly**: Smooth drag-and-drop with activation distance protection for mobile scrolling.
- **GitHub Pages Ready**: Zero backend required, pre-configured with relative base paths and an automated GitHub Actions deployment pipeline.

## Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run quality test suite
npm test

# Build for production
npm run build
```

## Hosting on GitHub Pages

1. Push this repository to GitHub.
2. In your repository settings, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Pushing to the `main` branch will automatically trigger the deployment workflow in `.github/workflows/deploy.yml`.

## Quality Constraints

- Strictly zero em-dashes across all copy and templates.
- Mobile touch targets adhere to Fitts's Law (minimum 44px).
- Bricolage Grotesque + Inter + JetBrains Mono typography.
- Catppuccin Mocha color tokens.
