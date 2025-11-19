import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { FaTimes, FaCalendarAlt, FaUser, FaCoffee, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import type { Local, Sala, ApiError } from '../types';

interface ReservationFormData {
  local_id: string;
  sala_id: string;
  data_inicio: string;
  data_fim: string;
  responsavel: string;
  descricao: string;
  cafe: boolean;
  quantidade_cafe: number;
}

interface ReservationFormProps {
  onClose: () => void;
  onSubmit: (data: {
    local_id: number;
    sala_id: number;
    data_inicio: string;
    data_fim: string;
    responsavel: string;
    descricao?: string;
    cafe: boolean;
    quantidade_cafe: number | null;
  }) => Promise<void>;
  reservation?: {
    id?: number;
    local_id?: number | string;
    sala_id?: number | string;
    local?: string;
    sala?: string;
    data_inicio?: string;
    data_fim?: string;
    responsavel?: string;
    descricao?: string | null;
    cafe?: boolean;
    quantidade_cafe?: number | null;
  } | null;
  title: string;
  locais: Local[];
  salas: Sala[];
  errorForm?: ApiError | null;
}

const ReservationForm = ({ 
  onClose, 
  onSubmit, 
  reservation, 
  title, 
  locais, 
  salas, 
  errorForm 
}: ReservationFormProps) => {
  const [formData, setFormData] = useState<ReservationFormData>({
    local_id: '',
    sala_id: '',
    data_inicio: '',
    data_fim: '',
    responsavel: '',
    descricao: '',
    cafe: false,
    quantidade_cafe: 0
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [salasFiltradas, setSalasFiltradas] = useState<Sala[]>([]);
  const [error, setError] = useState<string>('');

  // Preencher form se estiver editando
  useEffect(() => {
    if (reservation) {
      setFormData({
        local_id: reservation.local_id?.toString() || '',
        sala_id: reservation.sala_id?.toString() || '',
        data_inicio: reservation.data_inicio ? reservation.data_inicio.slice(0, 16) : '',
        data_fim: reservation.data_fim ? reservation.data_fim.slice(0, 16) : '',
        responsavel: reservation.responsavel || '',
        descricao: reservation.descricao || '',
        cafe: reservation.cafe || false,
        quantidade_cafe: reservation.quantidade_cafe || 0
      });

      if (reservation.local_id) {
        const localId = typeof reservation.local_id === 'string' 
          ? parseInt(reservation.local_id) 
          : reservation.local_id;
        const salasDoLocal = salas.filter(sala => sala.local_id === localId);
        setSalasFiltradas(salasDoLocal);
      }
    }
  }, [reservation, salas]);

  // Filtrar salas quando o local mudar
  useEffect(() => {
    if (formData.local_id) {
      const localId = parseInt(formData.local_id);
      const salasDoLocal = salas.filter(sala => sala.local_id === localId);
      setSalasFiltradas(salasDoLocal);
      setFormData(prev => ({ ...prev, sala_id: '' }));
    } else {
      setSalasFiltradas([]);
    }
  }, [formData.local_id, salas]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!formData.local_id || !formData.sala_id || !formData.data_inicio || !formData.data_fim || !formData.responsavel) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (new Date(formData.data_fim) <= new Date(formData.data_inicio)) {
      setError('A data de fim deve ser posterior à data de início');
      return;
    }

    if (formData.cafe && (!formData.quantidade_cafe || formData.quantidade_cafe <= 0)) {
      setError('Se café está marcado, a quantidade deve ser maior que zero');
      return;
    }

    // Validar tamanho dos campos
    if (formData.responsavel.length > 150) {
      setError('O nome do responsável não pode ter mais de 150 caracteres');
      return;
    }

    if (formData.descricao && formData.descricao.length > 1000) {
      setError('A descrição não pode ter mais de 1000 caracteres');
      return;
    }

    setLoading(true);

    try {
      const reservaData = {
        local_id: parseInt(formData.local_id),
        sala_id: parseInt(formData.sala_id),
        data_inicio: new Date(formData.data_inicio).toISOString(),
        data_fim: new Date(formData.data_fim).toISOString(),
        responsavel: formData.responsavel,
        descricao: formData.descricao || '',
        cafe: formData.cafe,
        quantidade_cafe: formData.cafe ? parseInt(formData.quantidade_cafe.toString()) : null
      };

      await onSubmit(reservaData);
    } catch (err) {
      console.error('Erro no formulário:', err);
      
      const apiError = err as ApiError;
      // Tratamento de erros HTTP conforme FE-07
      if (apiError.code === 400) {
        setError(apiError.message || 'Dados inválidos. Verifique os campos preenchidos.');
      } else if (apiError.code === 404) {
        setError('A reserva não existe mais ou foi excluída.');
      } else if (apiError.code === 409) {
        setError('Já existe uma reserva para esta sala neste intervalo de horário.');
      } else if (apiError.code === 500) {
        setError('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        setError(apiError.message || 'Erro ao salvar reserva. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2 text-gray-400" />
              Local *
            </label>
            <select
              name="local_id"
              value={formData.local_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Selecione um local</option>
              {locais.map(local => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Sala */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sala *
            </label>
            <select
              name="sala_id"
              value={formData.sala_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!formData.local_id || loading}
            >
              <option value="">
                {!formData.local_id 
                  ? 'Selecione um local primeiro' 
                  : salasFiltradas.length === 0 
                    ? 'Nenhuma sala disponível neste local'
                    : 'Selecione uma sala'
                }
              </option>
              {salasFiltradas.map(sala => (
                <option key={sala.id} value={sala.id}>
                  {sala.nome} {sala.capacidade && `- Capacidade: ${sala.capacidade}`}
                </option>
              ))}
            </select>
            {formData.local_id && salasFiltradas.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                Não há salas cadastradas para este local
              </p>
            )}
          </div>

          {/* Data e Hora de Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2 text-gray-400" />
              Data e Hora de Início *
            </label>
            <input
              type="datetime-local"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* Data e Hora de Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2 text-gray-400" />
              Data e Hora de Fim *
            </label>
            <input
              type="datetime-local"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2 text-gray-400" />
              Responsável *
            </label>
            <input
              type="text"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              placeholder="Nome do responsável pela reserva"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição da reunião ou evento"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Café */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="cafe"
              checked={formData.cafe}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FaCoffee className="inline mr-2 text-gray-400" />
              Serviço de café
            </label>
          </div>

          {/* Quantidade de Café */}
          {formData.cafe && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de café (pessoas)
              </label>
              <input
                type="number"
                name="quantidade_cafe"
                value={formData.quantidade_cafe}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.local_id || !formData.sala_id || !formData.data_inicio || !formData.data_fim || !formData.responsavel}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {loading ? 'Salvando...' : (reservation ? 'Atualizar' : 'Criar')}
            </button>
          </div>
          {error && (
            <div className={`mx-6 mt-4 border rounded-lg p-4 ${
              error.includes('409') || error.includes('conflito')
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className={`mt-0.5 flex-shrink-0 ${
                  error.includes('409') || error.includes('conflito') ? 'text-orange-500' : 'text-red-500'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    error.includes('409') || error.includes('conflito') ? 'text-orange-800' : 'text-red-800'
                  }`}>
                    {error.includes('409') || error.includes('conflito') ? 'Conflito de horário' : 'Não foi possível salvar a reserva'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    error.includes('409') || error.includes('conflito') ? 'text-orange-700' : 'text-red-700'
                  }`}>
                    {error}
                  </p>
                </div>
                <button 
                  onClick={() => setError('')}
                  className={`flex-shrink-0 ${
                    error.includes('409') || error.includes('conflito') ? 'text-orange-500 hover:text-orange-700' : 'text-red-500 hover:text-red-700'
                  }`}
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;

