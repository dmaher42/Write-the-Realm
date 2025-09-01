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

  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    // 3. Forward the client's request body to the Gemini API
    const geminiResponse = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body),
    });

    // 4. Parse the response from Gemini
    const geminiData = await geminiResponse.json();

    // 5. Check for errors from the Gemini API and forward them
    if (!geminiResponse.ok) {
        console.error("Error from Gemini API:", geminiData);
        return response.status(geminiResponse.status).json(geminiData);
    }
    
    // 6. Send the successful response back to the client
    return response.status(200).json(geminiData);

  } catch (error) {
    console.error('Error proxying request to Gemini:', error);
    return response.status(500).json({ error: 'An internal error occurred.' });
  }
}
