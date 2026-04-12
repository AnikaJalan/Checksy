export interface WolframResult {
  isCorrect: boolean;
  explanation: string;
}

export async function verifyMathAnswer(
  question: string,
  studentAnswer: string,
  apiKey: string
): Promise<WolframResult> {
  if (!apiKey) {
    return {
      isCorrect: false,
      explanation: 'Wolfram Alpha validation skipped due to missing API key.'
    };
  }

  try {
    const query = encodeURIComponent(`${question} = ${studentAnswer}`);
    const url = `https://api.wolframalpha.com/v1/result?appid=${apiKey}&i=${query}`;
    
    const response = await fetch(url, { headers: { accept: 'text/plain' } });
    if (!response.ok) {
      throw new Error(`Wolfram API returned ${response.status}`);
    }
    
    const text = await response.text();
    // Short Answer API usually evaluates math equivalence strings as strictly "True" or "False"
    const isCorrect = text.trim().toLowerCase() === 'true';

    return {
      isCorrect,
      explanation: isCorrect 
        ? 'Verified mathematically via Wolfram Alpha computation.' 
        : `Wolfram validation failed. Computed value does not equate properly: ${text}`
    };
  } catch (error) {
    console.error('Wolfram validation error:', error);
    return {
      isCorrect: false,
      explanation: 'Wolfram validation failed due to an execution error.'
    };
  }
}
