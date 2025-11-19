import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Sala, SalaFilters, ApiError } from '../types';

export const useSalas = (filters: SalaFilters = {}) => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSalas(filters);
      setSalas(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar salas');
      setSalas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.local_id, filters.ativo, filters.capacidade_min]);

  return { salas, loading, error, refetch: fetchSalas };
};

