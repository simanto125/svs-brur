import { supabase } from '@/lib/supabase';

export const MAX_BOOK_BYTES = 50 * 1024 * 1024;

export interface SignedUpload {
  path: string;
  token: string;
}

export function validateBookPdf(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Please choose a PDF file.';
  if (file.size > MAX_BOOK_BYTES) return 'PDF files must be 50 MB or smaller.';
  return null;
}

export async function uploadBookPdf(
  file: File,
  createUpload: (size: number) => Promise<SignedUpload>,
): Promise<string> {
  const { path, token } = await createUpload(file.size);
  const { error } = await supabase.storage
    .from('svs-media')
    .uploadToSignedUrl(path, token, file, { contentType: 'application/pdf' });
  if (error) {
    throw new Error('The PDF could not be uploaded. Please check your connection and try again.');
  }
  return path;
}
