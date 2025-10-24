import { z } from 'zod';

const NarrativeAnalysisSchema = z.object({
  hypeSummary: z.string(),
  backlashSummary: z.string(),
  weeklyPulse: z.string(),
});

export type NarrativeAnalysis = z.infer<typeof NarrativeAnalysisSchema>;

/**
 * Generate narrative analysis using Novita LLM API
 * @param topic - The topic being analyzed
 * @param tweets - Combined tweet texts
 * @returns Narrative analysis with hype, backlash, and weekly pulse summaries
 */
export async function analyzeNarratives(
  topic: string,
  tweets: string
): Promise<NarrativeAnalysis> {
  const apiKey = process.env.NOVITA_API_KEY;

  if (!apiKey) {
    throw new Error('NOVITA_API_KEY is not configured');
  }

  if (!tweets || tweets.trim().length === 0) {
    throw new Error('No tweet content provided for analysis');
  }

  const prompt = `You are a San Francisco cultural analyst. I will provide you with a collection of tweets about a specific topic. Your task is to analyze these tweets and return a JSON object with three keys: "hypeSummary", "backlashSummary", and "weeklyPulse".

- "hypeSummary": A 2-3 sentence summary of the positive, supportive, and excited viewpoints.
- "backlashSummary": A 2-3 sentence summary of the negative, critical, and skeptical viewpoints.
- "weeklyPulse": A comprehensive 4-5 sentence POST-BATTLE ANALYSIS that provides deep insight into:
  1. How this event reveals deeper tensions in SF's identity (tech hub vs livable city, progress vs preservation, etc.)
  2. What underlying values or fears are being expressed by both sides
  3. How this connects to SF's historical patterns or ongoing cultural debates
  4. What this says about power dynamics, economic forces, or community priorities
  5. The lasting impact or unresolved questions this leaves for the city

Make the weeklyPulse rich, nuanced, and thought-provoking. Go beyond surface-level observations to provide genuine cultural and sociological insight.

Here is the collection of tweets about ${topic}:
${tweets}

Return only the raw JSON object, with no other text.`;

  try {
    const response = await fetch('https://api.novita.ai/v3/openai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3.2-exp',
        messages: [
          {
            role: 'system',
            content: `You are a San Francisco cultural analyst specializing in urban sociology and tech culture. Provide deep, nuanced analysis that reveals underlying tensions and cultural dynamics.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Novita API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Novita API');
    }

    const content = data.choices[0].message.content;

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    
    // Remove ```json and ``` wrappers if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Try to parse the JSON response
    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', content);
      console.error('Cleaned content:', cleanedContent);
      throw new Error(`LLM response is not valid JSON: ${parseError}`);
    }

    // Validate the structure
    const validatedAnalysis = NarrativeAnalysisSchema.parse(parsedContent);

    return validatedAnalysis;
  } catch (error) {
    console.error(`Error analyzing narratives for ${topic}:`, error);

    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.message);
      throw new Error(
        `Invalid response format from LLM. Expected hypeSummary, backlashSummary, and weeklyPulse fields.`
      );
    }

    throw error;
  }
}

/**
 * Generate narrative analysis with retry logic
 * @param topic - The topic being analyzed
 * @param tweets - Combined tweet texts
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Narrative analysis
 */
export async function analyzeNarrativesWithRetry(
  topic: string,
  tweets: string,
  maxRetries: number = 3
): Promise<NarrativeAnalysis> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await analyzeNarratives(topic, tweets);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed for ${topic}:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to analyze narratives after ${maxRetries} attempts: ${lastError?.message}`
  );
}

