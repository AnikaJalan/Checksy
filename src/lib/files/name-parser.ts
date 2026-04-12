/**
 * Parses a student name heuristically from a typical assignment filename.
 * E.g., "John_Doe_Essay.docx" -> "John Doe Essay" -> "John Doe" (simplified)
 */
export function parseStudentName(fileName: string): string {
  if (!fileName) return 'Unknown Student';
  
  // Remove extension
  let baseName = fileName.replace(/\.[^/.]+$/, '');
  
  // Remove leading/trailing numbers (often sequence ids or student ids)
  baseName = baseName.replace(/^[0-9_-]+|[0-9_-]+$/g, '');
  
  // Replace underscores and hyphens with spaces
  baseName = baseName.replace(/[_-]/g, ' ');
  
  // Split CamelCase into words (e.g. JohnDoe -> John Doe)
  baseName = baseName.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Fallback if totally empty after cleaning
  return baseName.trim() || 'Unknown Student';
}
