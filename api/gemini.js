// Vercel Serverless Function to securely proxy requests to the Google Gemini API.
// This function reads the API key from server-side environment variables.

export default async function handler(request, response) {
  // 1. Check for the correct HTTP method
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Get the secret API key from Vercel's environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured on the server.' });
  }

  const geminiApiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; // Gemini API endpoint

  try {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return response.status(400).json({ error: 'Invalid JSON in request body.' });
    }

    if (!body || !body.contents) {
      return response.status(400).json({ error: 'Missing required field: contents' });
    }

    let geminiResponse;
    try {
      geminiResponse = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error('Network error contacting Gemini API:', err);
      return response.status(502).json({ error: 'Failed to reach Gemini API.' });
    }

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
        console.error("Error from Gemini API:", geminiData);
        return response.status(geminiResponse.status).json(geminiData);
    }

    return response.status(200).json(geminiData);

  } catch (error) {
    console.error('Error proxying request to Gemini:', error);
    return response.status(500).json({ error: 'An internal error occurred.' });
  }
}
