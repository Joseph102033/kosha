/**
 * Google Gemini API Client
 * Free tier: 1,500 requests/day, 10 RPM
 * Model: gemini-2.5-flash (high quality, fast)
 */

import type { Env } from '../index';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Call Google Gemini API with retry logic
 */
export async function callGemini(
  prompt: string,
  env: Env,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<string | null> {
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return null;
  }

  const modelName = 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const requestBody: GeminiRequest = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  };

  try {
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      // Handle rate limit
      if (response.status === 429) {
        console.error('Rate limit exceeded. Free tier: 10 RPM, 1,500 RPD');
      }

      return null;
    }

    const data = await response.json() as GeminiResponse;

    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in Gemini response');
      console.error('Full response:', JSON.stringify(data));
      return null;
    }

    const candidate = data.candidates[0];

    // Log finish reason to diagnose safety filter issues
    if (candidate.finishReason) {
      console.log('Gemini finish reason:', candidate.finishReason);
    }

    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('No content in Gemini candidate');
      console.error('Candidate data:', JSON.stringify(candidate));
      console.error('Full response:', JSON.stringify(data));
      return null;
    }

    const text = candidate.content.parts[0].text;

    // Log usage for monitoring
    if (data.usageMetadata) {
      console.log('Gemini usage:', {
        prompt: data.usageMetadata.promptTokenCount,
        output: data.usageMetadata.candidatesTokenCount,
        total: data.usageMetadata.totalTokenCount,
      });
    }

    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return null;
  }
}

/**
 * Parse JSON from Gemini response (handles markdown code blocks)
 */
export function parseGeminiJSON<T>(text: string): T | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();

    // Remove ```json ... ``` blocks
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('Failed to parse Gemini JSON:', error);
    return null;
  }
}
