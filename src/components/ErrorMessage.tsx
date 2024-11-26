import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
  suggestion?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, suggestion }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400"
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-medium">{message}</p>
          {suggestion && (
            <p className="text-sm mt-1 text-red-300">{suggestion}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};