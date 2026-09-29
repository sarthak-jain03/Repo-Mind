import axios from 'axios';

const API_KEY = process.env.FIREWORKS_API_KEY;
const BASE_URL = process.env.FIREWORKS_BASE_URL || 'https://api.fireworks.ai/inference/v1';
const EMBEDDING_MODEL = process.env.FIREWORKS_EMBEDDING_MODEL || 'nomic-ai/nomic-embed-text-v1.5';

export async function generateEmbedding(text) {
  const embeddings = await generateEmbeddings([text]);
  return embeddings.length > 0 ? embeddings[0] : null;
}

export async function generateEmbeddings(texts) {
  if (!texts || texts.length === 0) return [];

  const truncatedTexts = texts.map(t => (t.length > 8000 ? t.substring(0, 8000) : t));

  let retries = 5;
  while (retries > 0) {
    try {
      const response = await axios.post(
        `${BASE_URL}/embeddings`,
        { model: EMBEDDING_MODEL, input: truncatedTexts },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.data.map(item => item.embedding);
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw new Error(`Failed to generate embeddings after retries: ${error.message}`);
      }
      console.warn(`Fireworks API error: ${error.message}. Retrying in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

export function vectorToString(vector) {
  if (!vector) return null;
  return '[' + vector.join(',') + ']';
}
