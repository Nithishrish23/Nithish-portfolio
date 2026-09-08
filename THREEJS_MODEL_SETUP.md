# Three.js model setup

This branch uses Three.js + GLTFLoader for the interactive hero.

## Required avatar asset

The hero expects the real avatar model at exactly:

`public/nithish-model.glb`

The uploaded model is already wired to this filename in `src/PortfolioScene.jsx`.

The scene automatically:
- enters from below with a smooth scale-in animation
- rotates the model gently
- responds to pointer movement for subtle parallax
- renders a restrained technical grid, particle field and orbital geometry
- adapts to desktop and mobile sizes

## Visual direction

The portfolio uses a developer-workstation aesthetic rather than a generic futuristic gradient: near-black surfaces, GitHub-style green accents, blue technical highlights, monospaced UI labels, grid/scanline texture and thin engineering-style borders.

## Asset upload

Before running the production build, make sure the supplied binary GLB is committed as `public/nithish-model.glb`. Do not rename it unless `MODEL_URL` in `src/PortfolioScene.jsx` is changed as well.

The standalone conversation preview includes the uploaded GLB and is ready for local inspection.

No deployment is configured by this change.
