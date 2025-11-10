import { useState, useCallback } from 'react';
import API from '../API';

interface ScanResult {
  comicBookTitle?: string;
  title?: string;
  comicIssue: string;
  comicBookVolume: string;
  volume?: string;
  comicBookYear: string;
  year?: string;
  comicBookPublisher: string;
  type: 'regular' | 'variant';
  confidence: number;
}

interface ScanResponse {
  success: boolean;
  data?: ScanResult;
  error?: string;
}

export const useComicScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string>('');

  const scanCover = useCallback(async (imageUrl: string): Promise<ScanResult | null> => {
  if (!imageUrl) {
    setScanError('Please upload a cover image first');
    return null;
  }

  setIsScanning(true);
  setScanError('');

  try {
    console.log('Scanning cover:', imageUrl);

    const response = await API.post<ScanResponse>('/ai/scan-comic-cover', {
      imageUrl
    });

    // Check what we actually have
    if (response.data && typeof response.data === 'object') {
      // If response.data has success/data wrapper
      if ('success' in response.data && 'data' in response.data) {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
      } 
      // If response.data IS the data (no wrapper)
      else if ('comicBookTitle' in response.data) {
        return response.data as unknown as ScanResult;
      }
    }
    
    const errorMsg = 'Could not parse scan response';
    console.error('Scan failed:', errorMsg);
    setScanError(errorMsg);
    return null;

  } catch (error) {
    console.error('Scan error:', error);
    const errorMsg = error instanceof Error 
      ? error.message 
      : 'Failed to scan cover. Please try again.';
    setScanError(errorMsg);
    return null;
  } finally {
    setIsScanning(false);
  }
}, []);

  const clearError = useCallback(() => {
    setScanError('');
  }, []);

  return {
    scanCover,
    isScanning,
    scanError,
    clearError
  };
};