# Write the Realm

Write the Realm is a browser-based narrative adventure in which planning, descriptive writing and figurative language drive the game. The core Chapter 1 journey works locally without an AI service. Optional serverless functions can provide Google Gemini text generation and text-to-speech enhancements.

## Build

```bash
npm install
npm run build
```

The build script bundles `src/main.js` and copies the HTML, service worker, assets and runtime scene modules to `dist/`.

## Teacher settings

Open **Teacher Settings** from the in-game quest log. The selected mode is stored on the device separately from the student's saved journey.

- **Guided** keeps the normal targets and adds clickable sentence starters.
- **Standard** uses the normal targets, writing tips, word banks and Simile Power.
- **Challenge** raises the writing targets, hides optional scaffolds and removes Simile Power.

The required action-word choice remains available in every mode.

## Tests

Run the Node test suite:

```bash
npm test
```

Run the production build:

```bash
npm run build
```

The Chromium end-to-end tests use their own package so the main game remains lightweight:

```bash
cd e2e
npm install --package-lock=false
npx playwright install chromium
npm test
```

The browser suite completes Chapter 1, claims and equips the reward, saves the game, refreshes the page and verifies **Continue Journey** restores the progress. It also checks the Challenge-mode controls.

## Optional environment variable

The serverless API functions in `api/` use:

- `GEMINI_API_KEY` — Google Gemini access for `api/gemini.js` and `api/gemini-tts.js`.

Set this through the hosting provider when the optional AI enhancements are enabled. Core gameplay does not require the key.
