import test from 'node:test';
import assert from 'node:assert/strict';
import geminiHandler from '../api/gemini.js';
import ttsHandler from '../api/gemini-tts.js';

function createResponse() {
  return {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; }
  };
}

test('gemini proxy forwards request body and returns response', async (t) => {
  process.env.GEMINI_API_KEY = 'key';
  const mock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.ok(url.includes('gemini-2.5-flash-preview-05-20'));
    assert.deepEqual(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { hello: 'world' });
    return {
      ok: true,
      json: async () => ({ data: 'response' })
    };
  });

  const req = { method: 'POST', body: { hello: 'world' } };
  const res = createResponse();

  await geminiHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { data: 'response' });
  assert.equal(mock.mock.calls.length, 1);
});

test('gemini tts proxy forwards request body and returns response', async (t) => {
  process.env.GEMINI_API_KEY = 'key';
  const mock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.ok(url.includes('gemini-2.5-flash-preview-tts'));
    return {
      ok: true,
      json: async () => ({ audio: 'base64data' })
    };
  });

  const req = { method: 'POST', body: { text: 'hello' } };
  const res = createResponse();

  await ttsHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { audio: 'base64data' });
  assert.equal(mock.mock.calls.length, 1);
});
