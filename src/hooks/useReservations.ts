import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Reserva, ReservaFilters, ApiError } from '../types';

export const useReservations = (filters: ReservaFilters = {}) => {
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getReservations(filters);
      setReservations(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar reservas');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.data_inicio, filters.data_fim, filters.sala, filters.local, filters.responsavel, filters.page, filters.page_size]);

  return { reservations, loading, error, refetch: fetchReservations };
};

