import mammoth from 'mammoth';

/**
 * Extracts text from DOCX buffer
 */
export async function parseDocxDocument(buffer: Buffer): Promise<{
  text: string;
}> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      text: result.value.trim(),
    };
  } catch (error) {
    console.error('[DOCX Parse Error]', error);
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
