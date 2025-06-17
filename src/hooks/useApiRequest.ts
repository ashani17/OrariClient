import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';

interface UseApiRequestOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
}

export function useApiRequest<T = any>() {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cancelTokenSource, setCancelTokenSource] = useState<CancelTokenSource | null>(null);

    const executeRequest = useCallback(async (
        config: AxiosRequestConfig,
        options: UseApiRequestOptions<T> = {}
    ) => {
        // Cancel any existing request
        if (cancelTokenSource) {
            cancelTokenSource.cancel('Request cancelled');
        }

        // Create new cancel token
        const source = axios.CancelToken.source();
        setCancelTokenSource(source);

        try {
            setIsLoading(true);
            setError(null);
            const response = await axios({
                ...config,
                cancelToken: source.token
            });
            setData(response.data);
            options.onSuccess?.(response.data);
        } catch (err) {
            if (axios.isCancel(err)) {
                options.onCancel?.();
            } else {
                setError(err as Error);
                options.onError?.(err as Error);
            }
        } finally {
            setIsLoading(false);
            setCancelTokenSource(null);
        }
    }, [cancelTokenSource]);

    const cancelRequest = useCallback(() => {
        if (cancelTokenSource) {
            cancelTokenSource.cancel('Request cancelled by user');
        }
    }, [cancelTokenSource]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cancelTokenSource) {
                cancelTokenSource.cancel('Component unmounted');
            }
        };
    }, [cancelTokenSource]);

    return {
        data,
        error,
        isLoading,
        executeRequest,
        cancelRequest
    };
} 