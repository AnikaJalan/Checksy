import { ProviderGateway } from '@/lib/providers/gateway';
import { buildAiDetectionPrompt, parseAiDetectionResponse, AiDetectionResult } from '@/lib/grading/ai-detection';

export interface PlagiarismResult {
  aiDetection: AiDetectionResult;
  isHighRisk: boolean;
}

export async function analyzeSubmission(
  submissionText: string, 
  gateway: ProviderGateway
): Promise<PlagiarismResult> {
  try {
    const prompt = buildAiDetectionPrompt(submissionText);
    
    // We send a generic text generation request directly leveraging the model's intelligence securely.
    const response = await gateway.generate(prompt);
    
    const parsed = parseAiDetectionResponse(response);
    
    return {
      aiDetection: parsed,
      // Anything reasonably over 70 percent is considered high risk internally triggering UI warnings visually
      isHighRisk: parsed.percentage >= 70, 
    };
  } catch (error) {
    console.error('Plagiarism detection gateway failure:', error);
    return {
      aiDetection: {
        percentage: 0,
        flags: ['Execution failure during plagiarism detection API call.'],
        confidence: 'low',
        error: error instanceof Error ? error.message : 'Unknown gateway error'
      },
      isHighRisk: false,
    };
  }
}
