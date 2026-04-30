# WorldFork Site

Public landing page for [WorldFork](https://github.com/Hilo-Hilo/WorldFork).

This repo is intentionally separate from the backend/CLI product repo. It should stay static and public-facing: no backend connection, no simulation execution, no API keys.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

Recommended host: Vercel.

- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`

After the domain is connected in Vercel, add the domain to this README and link it from the main WorldFork repo.
