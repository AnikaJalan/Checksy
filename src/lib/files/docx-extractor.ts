import mammoth from 'mammoth';

/**
 * Extracts raw, formatting-free text from a DOCX buffer.
 */
export async function extractText(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid or empty buffer provided for DOCX extraction');
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    throw new Error(`Failed to extract DOCX text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
