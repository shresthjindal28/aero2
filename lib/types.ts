export type OtherEntity = { word: string; type: string; confidence?: number };

export interface MedicalEntities {
  diseases?: string[];
  medications?: string[];
  symptoms?: string[];
  procedures?: string[];
  other?: OtherEntity[];
}

export interface TranscriptionResult {
  text?: string;
  language_code?: string | null;
}

export interface ProcessAudioResult {
  transcription?: TranscriptionResult;
  medical_entities?: MedicalEntities;
}
