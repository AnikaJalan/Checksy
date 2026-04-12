import AdmZip from 'adm-zip';
import { extractText } from './docx-extractor';
import { parseStudentName } from './name-parser';

export interface ProcessedFile {
  fileName: string;
  studentName: string;
  textContent: string | null;
  error?: string;
}

/**
 * Reads a ZIP buffer, iterates through all valid DOCX files, 
 * and extracts their raw text and inferred metadata into memory asynchronously.
 */
export async function processZip(buffer: Buffer): Promise<ProcessedFile[]> {
  const processedFiles: ProcessedFile[] = [];
  
  try {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    for (const entry of zipEntries) {
      if (!entry.isDirectory && entry.entryName.toLowerCase().endsWith('.docx')) {
        // Exclude macOS specific hidden files sometimes trapped in zip
        if (entry.entryName.includes('__MACOSX') || entry.entryName.split('/').pop()?.startsWith('.')) {
          continue;
        }

        const fileBuffer = entry.getData();
        const fileName = entry.entryName.split('/').pop() || entry.entryName;
        const studentName = parseStudentName(fileName);
        
        try {
          const textContent = await extractText(fileBuffer);
          processedFiles.push({
            fileName,
            studentName,
            textContent,
          });
        } catch (error) {
          processedFiles.push({
            fileName,
            studentName,
            textContent: null,
            error: error instanceof Error ? error.message : 'Failed to extract text',
          });
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to process ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return processedFiles;
}
