import { GoogleGenAI } from "@google/genai";

// This handler will be deployed as a Vercel Serverless Function.
// The API_KEY will be set as an environment variable in the Vercel dashboard.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  const { isStream, args } = req.body;

  try {
    const model = ai.models;
    if (isStream) {
      const streamResponse = await model.generateContentStream(args);
      
      // Set headers for streaming
      res.writeHead(200, {
        'Content-Type': 'application/jsonl', // Use application/jsonl for newline-delimited JSON
        'Transfer-Encoding': 'chunked',
      });

      // Stream each chunk back to the client as a newline-delimited JSON string
      for await (const chunk of streamResponse) {
        res.write(JSON.stringify(chunk) + '\n');
      }
      res.end();

    } else {
      const response = await model.generateContent(args);
      res.status(200).json(response);
    }
  } catch (error) {
    console.error("API Error in Serverless Function:", error);
    res.status(500).json({ error: 'An error occurred while calling the Gemini API.' });
  }
}
