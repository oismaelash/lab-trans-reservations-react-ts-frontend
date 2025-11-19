import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Local, LocalFilters, ApiError } from '../types';

export const useLocais = (filters: LocalFilters = {}) => {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocais = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getLocais(filters);
      setLocais(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar locais');
      setLocais([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.ativo]);

  return { locais, loading, error, refetch: fetchLocais };
};

