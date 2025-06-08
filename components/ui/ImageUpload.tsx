'use client';

import { useRef, useState } from 'react';
import { Avatar } from './Avatar';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  currentImage?: string | null;
  userName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onImageUploaded: (url: string) => void;
  className?: string;
}

export function ImageUpload({ 
  currentImage, 
  userName, 
  size = 'lg', 
  onImageUploaded,
  className = '' 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploadImage, isUploading, progress, error, resetState } = useImageUpload();

  const handleFileSelect = async (file: File) => {
    try {
      resetState();
      const url = await uploadImage(file);
      onImageUploaded(url);
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative group cursor-pointer transition-all duration-200 ${
          dragOver ? 'scale-105' : ''
        }`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Avatar
          src={currentImage}
          alt={userName}
          size={size}
          fallbackText={userName}
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          isUploading ? 'opacity-100' : ''
        }`}>
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
              <span className="text-xs text-white font-medium">{progress}%</span>
            </div>
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Badge de upload */}
        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 shadow-lg group-hover:bg-blue-600 transition-colors">
          <Upload className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mensagem de erro */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={resetState}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Instruções */}
      {!currentImage && !isUploading && (
        <div className="absolute top-full left-0 right-0 mt-2 text-center">
          <p className="text-xs text-slate-500">
            Clique ou arraste uma imagem
          </p>
        </div>
      )}
    </div>
  );
} 