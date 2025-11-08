import { ProcessAudioResult } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

export async function processAudioFile(file: File): Promise<ProcessAudioResult> {
  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch(`${BACKEND_URL}/process_audio`, { method: 'POST', body: fd });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    const msg = (data && typeof data === 'object' && 'message' in data && (data as { message?: string }).message) || `Backend error: ${res.status}`;
    throw new Error(String(msg));
  }

  return data as ProcessAudioResult;
}
