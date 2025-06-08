import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface UploadProgress {
  progress: number;
  url: string | null;
  error: string | null;
}

export function useUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    url: null,
    error: null,
  });

  const uploadFile = async (file: File, path: string) => {
    try {
      setUploadProgress({ progress: 0, url: null, error: null });

      // Criar referência no Storage
      const storageRef = ref(storage, `${path}/${file.name}`);

      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);
      setUploadProgress(prev => ({ ...prev, progress: 50 }));

      // Obter URL do arquivo
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadProgress({ progress: 100, url: downloadURL, error: null });

      return downloadURL;
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        error: 'Erro ao fazer upload do arquivo',
      }));
      throw error;
    }
  };

  const uploadImage = async (file: File) => {
    // Validar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo deve ser uma imagem');
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('A imagem deve ter no máximo 5MB');
    }

    return uploadFile(file, 'images');
  };

  const uploadDocument = async (file: File) => {
    // Validar tipo do arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato de arquivo não suportado');
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('O arquivo deve ter no máximo 10MB');
    }

    return uploadFile(file, 'documents');
  };

  return {
    uploadImage,
    uploadDocument,
    uploadProgress,
  };
} 