# Allphone 3D Product Gallery

This repository hosts interactive 3D product experiences for the Allphone product-modeling workflow.

## Product Links

- Home / product picker: https://alllphoneproject.github.io/allphone3D/
- BeeTech Call Recorder: https://alllphoneproject.github.io/allphone3D/products/call-recorder-beetech/
- XTRIKE ME GP-52 Wireless Controller: https://alllphoneproject.github.io/allphone3D/products/xtrike-me-gp52/
- Static product index: https://alllphoneproject.github.io/allphone3D/products/

## Current Products

- **BeeTech Call Recorder**: React, Three.js, React Three Fiber, bilingual UI, microphone recording, playback, guided controls.
- **XTRIKE ME GP-52 Wireless Controller**: Standalone Three.js viewer with package unboxing, 360-degree inspection, control hotspots, and RGB lighting.

## Run Locally

Prerequisite: Node.js 18 or newer.

```sh
npm install
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:3000>.
On Windows, you can also double-click `Run_Local_Server.bat`.

Local product URLs:

- Product picker: <http://localhost:3000/>
- BeeTech Call Recorder: <http://localhost:3000/products/call-recorder-beetech/>
- GP-52 Wireless Controller: <http://localhost:3000/products/xtrike-me-gp52/index.html>

Do not open `index.html` or `dist/index.html` directly with a `file://` URL. Browser JavaScript modules, WebGL assets, and microphone access should be served over HTTP or HTTPS.

## Build

```sh
npm run build
npm run preview
```

## Deploy to GitHub Pages

Pushes to the `main` branch automatically build and deploy the site through the GitHub Actions workflow in `.github/workflows/deploy-pages.yml`.
