export interface AiDetectionResult {
  percentage: number;
  flags: string[];
  confidence: 'low' | 'medium' | 'high';
  error?: string;
}

export function buildAiDetectionPrompt(submission: string): string {
  return `You are an expert at detecting AI-generated text. 
Analyze the following student submission and determine the probability that it was written by an AI (such as ChatGPT, Claude, etc.) versus a human.

Look for:
- Lack of personal voice or overly uniform sentence structure
- Typical AI phrasing or transitions ("In conclusion", "It is important to note")
- Unnatural perfection or lack of human inconsistencies

Return ONLY a JSON object with this schema and NOTHING else:
{
  "percentage": number (0 to 100 representing the likelihood of AI generation),
  "flags": string[] (list of 1-3 specific reasons or phrases that triggered suspicion),
  "confidence": string ("low", "medium", "high" regarding your certainty)
}

Ensure your entire returned output is exclusively valid JSON, wrapped in standard curly braces, with no markdown code block fences before or after.

STUDENT SUBMISSION:
"""
${submission}
"""`;
}

export function parseAiDetectionResponse(raw: string): AiDetectionResult {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
    
    cleaned = cleaned.trim();
    
    const parsed = JSON.parse(cleaned);

    let percentage = typeof parsed.percentage === 'number' ? parsed.percentage : 0;
    // Strict clamp
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    let confidence = parsed.confidence && typeof parsed.confidence === 'string' ? parsed.confidence.toLowerCase() : 'low';
    if (!['low', 'medium', 'high'].includes(confidence)) {
      confidence = 'low';
    }

    return {
      percentage,
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      confidence: confidence as 'low' | 'medium' | 'high',
    };
  } catch (error) {
    return {
      percentage: 0,
      flags: ['Analysis failed due to unparseable response formatting.'],
      confidence: 'low',
      error: 'Parse failure',
    };
  }
}
