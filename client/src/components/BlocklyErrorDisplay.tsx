"use client";
import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface BlocklyErrorDisplayProps {
  error: {
    message: string;
    blockId?: string;
  } | null;
  onDismiss: () => void;
  onHighlightBlock: (blockId: string) => void;
}

const BlocklyErrorDisplay: React.FC<BlocklyErrorDisplayProps> = ({
  error,
  onDismiss,
  onHighlightBlock,
}) => {
  if (!error) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 animate-in slide-in-from-bottom-5 duration-300">
      <div className="max-w-xl mx-auto bg-red-900/20 border border-red-500/40 rounded-md p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-red-400">Code Generation Error</p>
              <button
                onClick={onDismiss}
                className="ml-3 flex-shrink-0 p-0.5 rounded-md hover:bg-red-500/20 transition-colors"
              >
                <X className="h-4 w-4 text-red-400" />
              </button>
            </div>
            <p className="mt-1 text-sm text-red-200">{error.message}</p>
            
            {error.blockId && (
              <button
                onClick={() => onHighlightBlock(error.blockId!)}
                className="mt-2 px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded transition-colors inline-flex items-center"
              >
                Highlight Problem Block
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlocklyErrorDisplay;