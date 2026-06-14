# Allphone 3D Product Workspace

## Overview

Allphone 3D is a product-modeling and interactive presentation workspace. The repository contains a product picker at the root URL and independent product experiences under `public/products/`.

## Products

### BeeTech Call Recorder

The BeeTech recorder is a React/Vite/Three.js product demo. It uses React Three Fiber for the 3D recorder, a bilingual Hebrew/English overlay, microphone recording through the browser MediaRecorder API, playback, guided hotspots, and a simulated fallback when microphone permission is denied.

Key files:

- `src/App.tsx`: Root product picker and BeeTech route switch.
- `src/components/Scene.tsx`: BeeTech 3D recorder model and interactions.
- `src/components/UI.tsx`: BeeTech overlay UI and tutorial.
- `src/AppContext.tsx`: BeeTech state, recording, playback, language, and power behavior.

### XTRIKE ME GP-52 Wireless Controller

The GP-52 controller is a standalone Three.js viewer under `public/products/xtrike-me-gp52/`. It loads the controller from embedded GLB data, loads the retail package from `assets/xtrike_gp52_package.glb`, supports package unboxing, 360-degree inspection, clickable controls, and RGB modes activated from the rear LIGHT switch.

Key files:

- `public/products/xtrike-me-gp52/index.html`: Standalone product page.
- `public/products/xtrike-me-gp52/app.js`: Viewer, interaction, camera, package, power, and RGB logic.
- `public/products/xtrike-me-gp52/model-data.js`: Embedded GP-52 controller GLB data.
- `public/products/xtrike-me-gp52/assets/xtrike_gp52_package.glb`: Retail package model.

## Local Development Notes

Use `npm run dev` or `Run_Local_Server.bat`. For local GP-52 testing, open `/products/xtrike-me-gp52/index.html` because Vite's SPA fallback can intercept `/products/xtrike-me-gp52/` during development.

Keep Hebrew text files in UTF-8. If Hebrew appears garbled in PowerShell output, verify in the browser before editing.

## Deployment

GitHub Pages is built from `main` by `.github/workflows/deploy-pages.yml`. The Vite config uses `base: './'` so the built files work under the `/allphone3D/` project path.
