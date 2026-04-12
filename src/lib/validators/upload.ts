export function validateUploadFile(file: File | null): string | null {
  if (!file) {
    return 'No file uploaded.';
  }

  // 50MB limit
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return 'File size exceeds 50MB limit.';
  }

  if (file.size === 0) {
    return 'File is empty.';
  }

  const isZip = file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip');
  if (!isZip) {
    return 'File must be a ZIP archive.';
  }

  return null;
}
