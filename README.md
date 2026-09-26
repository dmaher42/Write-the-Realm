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

## Explore Kokura

After choosing a Guardian and realm, move the Guardian through the 3D village with **WASD** or the **arrow keys**. Walk near the Village Elder at the gate and press **E** to begin Chapter 1. After the chapter, the Market Garden, Harbour Chapel and Kokura Keep can also be explored in the village with **E**. The camera follows the Guardian, and the Guardian stays on the island paths. The village position is saved on this device for **Continue Journey**.

The **Visit the Village Elder** button remains available for keyboard and assistive technology users, and for devices without WebGL. The game uses one lightweight procedural scene and does not require an AI service to move or play.

During the three-turn writing battle, students receive a short note about the feature the game detected and one concrete idea for improving their next line. Extra craft can strengthen a move, while meeting each turn’s writing goal still completes the battle in three turns. These offline word and pattern checks are writing prompts, not a teacher assessment of meaning or quality. The chapter reward uses the saved battle notes so feedback remains available after a refresh.

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

The browser suite walks to the Elder, checks movement and interaction in the village, then completes Chapter 1, claims and equips the reward, saves the game, refreshes the page and verifies **Continue Journey** restores progress. It also checks the Challenge-mode controls and the WebGL fallback.

## Optional environment variable

The serverless API functions in `api/` use:

- `GEMINI_API_KEY` — Google Gemini access for `api/gemini.js` and `api/gemini-tts.js`.

Set this through the hosting provider when the optional AI enhancements are enabled. Core gameplay does not require the key.
