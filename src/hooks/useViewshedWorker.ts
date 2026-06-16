import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewshedRequest, ViewshedResponse, ViewshedWorkerResult } from '@/types/viewshed';

export function useViewshedWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [result, setResult] = useState<ViewshedResponse | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const compute = useCallback((req: ViewshedRequest) => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/viewshedWorker.ts', import.meta.url), {
        type: 'module',
      });
      workerRef.current.onmessage = (e: MessageEvent<ViewshedWorkerResult>) => {
        setIsComputing(false);
        if (e.data.type === 'result') {
          setResult(e.data.payload);
          setError(null);
        } else {
          setError(e.data.message);
        }
      };
    }

    setIsComputing(true);
    setError(null);
    workerRef.current.postMessage({ type: 'compute', payload: req });
  }, []);

  return { compute, result, isComputing, error };
}
