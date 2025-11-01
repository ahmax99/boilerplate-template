# Storybook Documentation

This project uses [Storybook](https://storybook.js.org/) for component development and documentation.

## Directory Structure

- `src/stories/components/` - Contains all UI component stories organized by atomic design (atoms, molecules, organisms)
- `src/stories/tokens/` - Contains design token documentation (colors, typography, spacing)

## Running Storybook

Start the development server:

```bash
pnpm storybook
```

Open [http://localhost:6006](http://localhost:6006) to view the component library.

## Writing Stories

1. Create `.stories.tsx` files alongside components
2. Stories should cover:
   - Basic usage
   - All variants/states
   - Edge cases
3. Follow the existing patterns from other stories

## Features

- Auto-generated documentation
- Interactive component playground
- Accessibility testing
- Visual regression testing
- Dark/light mode support

## Building for Production

Generate static files for deployment:

```bash
pnpm run build-storybook
```

This creates production-ready files in `storybook-static/`.

## Next.js Integration

This Storybook is configured to work with:
- Next.js App Router
- Server Components
- Tailwind CSS

## Testing

Run component tests:

```bash
pnpm run test-storybook
```

## Deployment

Deploy to Chromatic or as a static site to platforms like Vercel, Netlify, or GitHub Pages.
