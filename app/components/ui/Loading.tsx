'use client';

import { Spinner } from './Spinner';

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
}

export function Loading({ fullScreen = false, text = 'Carregando...' }: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
          <Spinner className="w-10 h-10 text-primary" />
          <p className="mt-4 text-gray-600">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Spinner className="w-6 h-6 text-primary" />
      <span className="ml-2 text-gray-600">{text}</span>
    </div>
  );
} 