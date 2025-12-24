
export interface StyleOption {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
}

export interface TransformationState {
  originalImage: string | null;
  resultImage: string | null;
  status: 'idle' | 'processing' | 'success' | 'error';
  errorMessage: string | null;
}
