import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extracts text from PDF buffer
 * Handles both text-based PDFs and honestly reports scanned image PDFs
 */
export async function parsePdfDocument(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
  isScanned: boolean;
}> {
  try {
    const data = await pdf(buffer);
    
    const text = data.text.trim();
    const pageCount = data.numpages;
    
    // Heuristic: if we have many pages but very little text, likely scanned
    const avgCharsPerPage = text.length / pageCount;
    const isScanned = pageCount > 2 && avgCharsPerPage < 100;
    
    if (isScanned) {
      return {
        text: '',
        pageCount,
        isScanned: true,
      };
    }
    
    return {
      text,
      pageCount,
      isScanned: false,
    };
  } catch (error) {
    console.error('[PDF Parse Error]', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
