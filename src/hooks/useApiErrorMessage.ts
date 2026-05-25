import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { ApiError } from '../services/api';

export function useApiErrorMessage(fallbackKey = 'auth.connectionError') {
  const { t } = useLanguage();

  return useCallback(
    (err: unknown) => {
      const apiErr = err as ApiError;
      return apiErr.response?.data?.message ?? t(fallbackKey);
    },
    [t, fallbackKey]
  );
}
