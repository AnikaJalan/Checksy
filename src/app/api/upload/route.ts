import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { validateUploadFile } from '@/lib/validators/upload';
import { processZip } from '@/lib/files/zip-processor';

export async function POST(req: Request) {
  try {
    const teacher = await getTeacher();
    if (!teacher) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    const validationError = validateUploadFile(file);
    if (validationError) {
      return new NextResponse(validationError, { status: 400 });
    }

    // Convert Next.js File to Buffer for AdmZip
    const arrayBuffer = await file!.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const processedFiles = await processZip(buffer);

    if (processedFiles.length === 0) {
      return new NextResponse('ZIP archive did not contain any valid .docx files.', { status: 400 });
    }

    return NextResponse.json({
      count: processedFiles.length,
      manifest: processedFiles.map((pf) => ({
        fileName: pf.fileName,
        studentName: pf.studentName,
        error: pf.error,
        textContent: pf.textContent,
      }))
    });
  } catch (error) {
    console.error('File processing error:', error);
    return new NextResponse('Error processing the file.', { status: 500 });
  }
}
