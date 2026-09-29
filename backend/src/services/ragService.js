import axios from 'axios';
import * as vectorStoreService from './vectorStoreService.js';

const API_KEY = process.env.FIREWORKS_API_KEY;
const BASE_URL = process.env.FIREWORKS_BASE_URL || 'https://api.fireworks.ai/inference/v1';
const CHAT_MODEL = process.env.FIREWORKS_CHAT_MODEL || 'accounts/fireworks/models/qwen3p8-max';
const TOP_K = 8;

export async function query(repoId, userQuestion) {
  const relevantChunks = await vectorStoreService.similaritySearch(repoId, userQuestion, TOP_K);

  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      response: "I couldn't find any relevant code in this repository for your question. " +
        "Make sure the repository is indexed and try rephrasing your question.",
      sources: [],
    };
  }

  let context = '';
  const sources = [];

  for (let i = 0; i < relevantChunks.length; i++) {
    const chunk = relevantChunks[i];
    context += `\n--- Source ${i + 1}: ${chunk.file_path} (lines ${chunk.start_line}-${chunk.end_line}) ---\n`;
    context += chunk.content + '\n';

    sources.push({
      filePath: chunk.file_path,
      startLine: chunk.start_line,
      endLine: chunk.end_line,
      snippet: chunk.content.length > 200
        ? chunk.content.substring(0, 200) + '...'
        : chunk.content,
    });
  }

  const systemPrompt = `You are RepoMind, an expert coding assistant. You have been given relevant code snippets
from the user's GitHub repository to answer their question.

IMPORTANT RULES:
1. ONLY answer based on the provided code context. Do NOT make up code or functionality
   that doesn't exist in the provided snippets.
2. If the code context doesn't contain enough information to fully answer the question,
   say so explicitly and explain what information is missing.
3. When referencing code, mention the specific file path and line numbers.
4. Provide clear, actionable explanations with code examples when relevant.
5. Format your response using Markdown for better readability.
6. If you identify potential bugs or improvements in the code, mention them.

REPOSITORY CODE CONTEXT:
${context}`;

  const aiResponse = await callChatCompletion(systemPrompt, userQuestion);
  return { response: aiResponse, sources };
}

async function callChatCompletion(systemPrompt, userMessage) {
  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 2048,
        temperature: 0.1,
        top_p: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const choices = response.data.choices;
    if (choices && choices.length > 0) {
      return choices[0].message.content;
    }

    return 'I received an empty response. Please try again.';
  } catch (error) {
    if (error.response) {
      console.error(`Fireworks API error: HTTP ${error.response.status}`);
      return 'I encountered an API error. Details: ' + JSON.stringify(error.response.data);
    }
    console.error('Chat completion failed:', error.message);
    return 'An error occurred while processing your request. Error: ' + error.message;
  }
}
