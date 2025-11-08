import { useState, useCallback } from 'react';

interface UseCopyToClipboardReturn {
  copiedValue: string | null;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Custom hook for copying text to clipboard with automatic reset
 * @param resetDelay - Time in milliseconds before resetting copied state (default: 2000)
 * @returns Object with copiedValue, copy function, and reset function
 */
export function useCopyToClipboard(resetDelay = 2000): UseCopyToClipboardReturn {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        console.warn('Clipboard API not available');
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopiedValue(text);

        // Auto-reset after delay
        if (resetDelay > 0) {
          setTimeout(() => {
            setCopiedValue(null);
          }, resetDelay);
        }

        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        setCopiedValue(null);
        return false;
      }
    },
    [resetDelay]
  );

  const reset = useCallback(() => {
    setCopiedValue(null);
  }, []);

  return { copiedValue, copy, reset };
}
