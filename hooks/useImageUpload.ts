'use client';

import { useState } from 'react';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
}

export function useImageUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    url: null
  });

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        url: null
      });

      // Validações no frontend
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas imagens são permitidas');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 5MB');
      }

      setUploadState(prev => ({ ...prev, progress: 25 }));

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', file);

      setUploadState(prev => ({ ...prev, progress: 50 }));

      // Fazer upload
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      setUploadState(prev => ({ ...prev, progress: 75 }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();
      
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        url: result.url
      });

      return result.url;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        url: null
      });
      throw error;
    }
  };

  const resetState = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      url: null
    });
  };

  return {
    uploadImage,
    resetState,
    ...uploadState
  };
} 