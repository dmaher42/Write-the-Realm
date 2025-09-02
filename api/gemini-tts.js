// Vercel Serverless Function to securely proxy requests to the Google Gemini TTS API.

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured on the server.' });
  }

  const ttsApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  try {
    const geminiResponse = await fetch(ttsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body),
    });

    const geminiData = await geminiResponse.json();
    
    if (!geminiResponse.ok) {
        console.error("Error from Gemini TTS API:", geminiData);
        return response.status(geminiResponse.status).json(geminiData);
    }

    return response.status(200).json(geminiData);

  } catch (error) {
    console.error('Error proxying request to Gemini TTS:', error);
    return response.status(500).json({ error: 'An internal error occurred.' });
  }
}
