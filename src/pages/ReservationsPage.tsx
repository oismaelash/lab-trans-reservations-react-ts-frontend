import { useState } from 'react';
import { FaCalendarAlt, FaSearch, FaPlus, FaFilter } from 'react-icons/fa';
import ReservationCard from '../components/ReservationCard';
import ReservationForm from '../components/ReservationForm';
import DeleteModal from '../components/DeleteModal';
import ReservationButton from '../components/ReservationButton';
import ParticipantesManager from '../components/ParticipantesManager';
import { useReservations } from '../hooks/useReservations';
import { useLocais } from '../hooks/useLocais';
import { useSalas } from '../hooks/useSalas';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import type { Reserva, ApiError } from '../types';

interface Filters {
  searchTerm: string;
  selectedLocal: string;
  selectedSala: string;
  dataInicio: string;
  dataFim: string;
  responsavel: string;
}


const ReservationsPage = () => {
  const { user } = useAuth();
  const {
    modals,
    openReservationForm,
    closeReservationForm,
    setReservationFormError,
    openReservationDelete,
    closeReservationDelete,
    openParticipantes,
    closeParticipantes,
  } = useModal();
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    selectedLocal: '',
    selectedSala: '',
    dataInicio: '',
    dataFim: '',
    responsavel: ''
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Buscar dados
  const { locais } = useLocais({ ativo: true });
  const salasFilters = filters.selectedLocal 
    ? { local_id: parseInt(filters.selectedLocal), ativo: true } 
    : { ativo: true };
  const { salas } = useSalas(salasFilters);
  
  // Preparar filtros para API - converter IDs para nomes
  const apiFilters: Record<string, string> = {};
  if (filters.selectedLocal) {
    const localSelecionado = locais.find(l => l.id === parseInt(filters.selectedLocal));
    if (localSelecionado) {
      apiFilters.local = localSelecionado.nome;
    }
  }
  if (filters.selectedSala) {
    const salaSelecionada = salas.find(s => s.id === parseInt(filters.selectedSala));
    if (salaSelecionada) {
      apiFilters.sala = salaSelecionada.nome;
    }
  }
  if (filters.dataInicio) apiFilters.data_inicio = new Date(filters.dataInicio).toISOString();
  if (filters.dataFim) apiFilters.data_fim = new Date(filters.dataFim).toISOString();
  if (filters.responsavel) apiFilters.responsavel = filters.responsavel;
  
  const { reservations, loading, error, refetch } = useReservations(apiFilters);

  // Filtrar reservas localmente por termo de busca
  const filteredReservations = reservations.filter((reserva: Reserva) => {
    const matchesSearch = !filters.searchTerm || 
      reserva.sala?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      reserva.responsavel?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      reserva.local?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleCreateReservation = async (reservaData: {
    local_id: number;
    sala_id: number;
    data_inicio: string;
    data_fim: string;
    responsavel: string;
    descricao?: string;
    cafe: boolean;
    quantidade_cafe: number | null;
  }) => {
    try {
      setReservationFormError(null);
      setSuccess(null);
      
      // Encontrar local e sala pelos IDs para obter os nomes
      const local = locais.find(l => l.id === reservaData.local_id);
      const sala = salas.find(s => s.id === reservaData.sala_id);
      
      if (!local) {
        throw new Error('Local não encontrado');
      }
      if (!sala) {
        throw new Error('Sala não encontrada');
      }
      
      const payload = {
        local_id: reservaData.local_id,
        sala_id: reservaData.sala_id,
        local: local.nome,
        sala: sala.nome,
        data_inicio: reservaData.data_inicio,
        data_fim: reservaData.data_fim,
        responsavel: reservaData.responsavel,
        descricao: reservaData.descricao || '',
        cafe: reservaData.cafe || false,
        quantidade_cafe: reservaData.cafe ? parseInt(reservaData.quantidade_cafe?.toString() || '0') : null
      };
      
      await apiService.createReservation(payload);
      await refetch();
      closeReservationForm();
      setSuccess('Reserva criada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setReservationFormError(err as ApiError);
      throw err;
    }
  };

  const handleEditReservation = async (reservaData: {
    local_id: number;
    sala_id: number;
    data_inicio: string;
    data_fim: string;
    responsavel: string;
    descricao?: string;
    cafe: boolean;
    quantidade_cafe: number | null;
  }) => {
    try {
      setReservationFormError(null);
      setSuccess(null);
      
      if (!modals.reservationForm.data) {
        throw new Error('Dados da reserva não encontrados');
      }
      
      // Encontrar local e sala pelos IDs para obter os nomes
      const local = locais.find(l => l.id === reservaData.local_id);
      const sala = salas.find(s => s.id === reservaData.sala_id);
      
      if (!local) {
        throw new Error('Local não encontrado');
      }
      if (!sala) {
        throw new Error('Sala não encontrada');
      }
      
      const payload = {
        local_id: reservaData.local_id,
        sala_id: reservaData.sala_id,
        local: local.nome,
        sala: sala.nome,
        data_inicio: reservaData.data_inicio,
        data_fim: reservaData.data_fim,
        responsavel: reservaData.responsavel,
        descricao: reservaData.descricao || '',
        cafe: reservaData.cafe || false,
        quantidade_cafe: reservaData.cafe ? parseInt(reservaData.quantidade_cafe?.toString() || '0') : null
      };
      
      await apiService.updateReservation(modals.reservationForm.data.id, payload);
      await refetch();
      closeReservationForm();
      setSuccess('Reserva atualizada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setReservationFormError(err as ApiError);
      throw err;
    }
  };

  const handleDeleteReservation = async () => {
    try {
      if (!modals.reservationDelete.data) {
        return;
      }
      await apiService.deleteReservation(modals.reservationDelete.data.id);
      await refetch();
      closeReservationDelete();
      setSuccess('Reserva deletada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao deletar reserva:', err);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedLocal: '',
      selectedSala: '',
      dataInicio: '',
      dataFim: '',
      responsavel: ''
    });
  };

  const hasActiveFilters = filters.selectedLocal || filters.selectedSala || 
    filters.dataInicio || filters.dataFim || filters.responsavel;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <main className="container mx-auto px-4 py-8">
        {/* Mensagens */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => {}} className="text-red-700 hover:text-red-900">×</button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">×</button>
            </div>
          </div>
        )}

        {/* Cabeçalho e Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reservas de Salas</h2>
              <p className="text-gray-600">Gerencie todas as reservas de salas de reunião</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por sala, local ou responsável..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                  hasActiveFilters 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter />
                Filtros
                {hasActiveFilters && <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">!</span>}
              </button>

              <ReservationButton onNewReservation={() => openReservationForm('create')} />
            </div>
          </div>

          {/* Painel de Filtros Expandido */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.selectedLocal}
                  onChange={(e) => {
                    setFilters({ ...filters, selectedLocal: e.target.value, selectedSala: '' });
                  }}
                >
                  <option value="">Todos os locais</option>
                  {locais.map(local => (
                    <option key={local.id} value={local.id}>{local.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.selectedSala}
                  onChange={(e) => setFilters({ ...filters, selectedSala: e.target.value })}
                  disabled={!filters.selectedLocal}
                >
                  <option value="">Todas as salas</option>
                  {salas.map(sala => (
                    <option key={sala.id} value={sala.id}>{sala.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.responsavel}
                  onChange={(e) => setFilters({ ...filters, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.dataInicio}
                  onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.dataFim}
                  onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grid de Reservas */}
        {filteredReservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReservations.map(reserva => (
              <ReservationCard
                key={reserva.id}
                reserva={{
                  id: reserva.id,
                  local: reserva.local || reserva.local_nome,
                  sala: reserva.sala || reserva.sala_nome,
                  data_inicio: reserva.data_inicio,
                  data_fim: reserva.data_fim,
                  responsavel: reserva.responsavel,
                  descricao: reserva.descricao,
                  cafe: reserva.cafe,
                  quantidade_cafe: reserva.quantidade_cafe,
                  criado_por_email: reserva.criado_por_email,
                  status: 'active'
                }}
                currentUserEmail={user?.email || null}
                onEdit={() => {
                  const local = locais.find(l => l.nome === reserva.local || l.id === reserva.local_id);
                  const sala = salas.find(s => s.nome === reserva.sala || s.id === reserva.sala_id);
                  openReservationForm('edit', {
                    id: reserva.id,
                    local_id: local?.id,
                    sala_id: sala?.id,
                    local: reserva.local || reserva.local_nome,
                    sala: reserva.sala || reserva.sala_nome,
                    data_inicio: reserva.data_inicio,
                    data_fim: reserva.data_fim,
                    responsavel: reserva.responsavel,
                    descricao: reserva.descricao,
                    cafe: reserva.cafe,
                    quantidade_cafe: reserva.quantidade_cafe
                  });
                }}
                onDelete={() => {
                  openReservationDelete({
                    id: reserva.id,
                    local: reserva.local || reserva.local_nome,
                    sala: reserva.sala || reserva.sala_nome,
                    data_inicio: reserva.data_inicio,
                    data_fim: reserva.data_fim,
                    responsavel: reserva.responsavel
                  });
                }}
                onManageParticipantes={() => {
                  openParticipantes(reserva.id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasActiveFilters || filters.searchTerm ? 'Nenhuma reserva encontrada' : 'Nenhuma reserva agendada'}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters || filters.searchTerm
                  ? 'Tente ajustar os filtros de busca para ver mais resultados.'
                  : 'Comece criando sua primeira reserva de sala de reunião.'
                }
              </p>
              {!hasActiveFilters && !filters.searchTerm && (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto shadow-sm hover:shadow-md"
                  onClick={() => openReservationForm('create')}
                >
                  <FaPlus />
                  Criar Primeira Reserva
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modais */}
      {modals.reservationForm.isOpen && modals.reservationForm.mode === 'create' && (
        <ReservationForm
          onClose={closeReservationForm}
          onSubmit={handleCreateReservation}
          title="Nova Reserva"
          locais={locais}
          salas={salas}
          errorForm={modals.reservationForm.error}
        />
      )}

      {modals.reservationForm.isOpen && modals.reservationForm.mode === 'edit' && modals.reservationForm.data && (
        <ReservationForm
          onClose={closeReservationForm}
          onSubmit={handleEditReservation}
          reservation={modals.reservationForm.data}
          title="Editar Reserva"
          locais={locais}
          salas={salas}
          errorForm={modals.reservationForm.error}
        />
      )}

      {modals.reservationDelete.isOpen && modals.reservationDelete.data && (
        <DeleteModal
          reservation={modals.reservationDelete.data}
          onClose={closeReservationDelete}
          onConfirm={handleDeleteReservation}
        />
      )}

      {modals.participantes.isOpen && modals.participantes.reservaId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Gerenciar Participantes</h2>
              <button
                onClick={closeParticipantes}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6">
              <ParticipantesManager
                reservaId={modals.participantes.reservaId}
                onUpdate={() => {
                  refetch();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;

