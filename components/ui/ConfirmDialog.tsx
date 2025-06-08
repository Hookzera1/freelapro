'use client';

import { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmDialogOptions & { resolve: (value: boolean) => void }>();

  const confirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ ...options, resolve });
    });
  };

  const handleClose = (confirmed: boolean) => {
    dialog?.resolve(confirmed);
    setDialog(undefined);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    dialog.type === 'danger' ? 'bg-red-100' :
                    dialog.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${
                      dialog.type === 'danger' ? 'text-red-600' :
                      dialog.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{dialog.title}</h3>
                </div>
                <p className="mt-4 text-slate-600">{dialog.message}</p>
              </div>
              <div className="border-t border-slate-200 p-4 flex justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  {dialog.cancelText || 'Cancelar'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    dialog.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    dialog.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {dialog.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog deve ser usado dentro de um ConfirmDialogProvider');
  }
  return context;
} 