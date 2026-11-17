export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf'];

export interface UploadPayload {
  name: string;
  type: string;
  data: string;
}

const MAX_RAW_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const TARGET_IMAGE_BYTES = 500 * 1024;

export function validateFile(file: File, types: string[]): string | null {
  if (!types.includes(file.type)) return 'This file type is not supported.';
  if (file.type.startsWith('image/')) {
    if (file.size > MAX_RAW_IMAGE_BYTES) return 'Photos must be 25 MB or smaller before resizing.';
    return null;
  }
  if (file.size > MAX_UPLOAD_BYTES) return 'Files must be 4 MB or smaller.';
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this photo. Please try a different file.'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process this photo'))),
      'image/webp',
      quality,
    );
  });
}

async function compressImage(file: File): Promise<File> {
  const img = await loadImage(file);
  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not process this photo');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.85;
    let blob = await canvasToBlob(canvas, quality);
    while (blob.size > TARGET_IMAGE_BYTES && quality > 0.5) {
      quality = Math.round((quality - 0.1) * 100) / 100;
      blob = await canvasToBlob(canvas, quality);
    }
    const name = `${file.name.replace(/\.[^.]+$/, '')}.webp`;
    return new File([blob], name, { type: blob.type });
  } finally {
    URL.revokeObjectURL(img.src);
  }
}

export async function toUploadPayload(file: File): Promise<UploadPayload> {
  const ready = file.type.startsWith('image/') ? await compressImage(file) : file;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve({ name: ready.name, type: ready.type, data: result.split(',')[1] ?? '' });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(ready);
  });
}
