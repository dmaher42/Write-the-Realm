# Write the Realm

Write the Realm is a 3D narrative adventure built with [Three.js](https://threejs.org/).  Serverless functions proxy requests to the Google Gemini API for content generation and text-to-speech.

## Build

```bash
npm install
npm run build
```

The build script bundles `src/main.js` and copies HTML, CSS, the service worker, and the `assets/` folder to the `dist/` directory.

## Tests

Run the test suite with:

```bash
npm test
```

## Environment Variables

The serverless API functions in `api/` require a Gemini API key:

- `GEMINI_API_KEY` – key for Google Gemini used by `api/gemini.js` and `api/gemini-tts.js`.

Provide this environment variable through your hosting provider (e.g. Vercel) before deploying.
