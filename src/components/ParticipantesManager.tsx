import { useState, useEffect, FormEvent } from 'react';
import { FaUsers, FaUserPlus, FaTimes, FaSearch, FaUser } from 'react-icons/fa';
import { apiService } from '../services/api';
import type { Participante, Usuario, ApiError } from '../types';

interface ParticipantesManagerProps {
  reservaId: number;
  onUpdate?: () => void;
}

const ParticipantesManager = ({ reservaId, onUpdate }: ParticipantesManagerProps) => {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [nomeManual, setNomeManual] = useState<string>('');
  const [addMode, setAddMode] = useState<'usuario' | 'manual'>('usuario');

  useEffect(() => {
    loadParticipantes();
  }, [reservaId]);

  const loadParticipantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getParticipantes(reservaId);
      setParticipantes(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar participantes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await apiService.searchUsuarios(searchQuery);
      setSearchResults(results);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao buscar usuários');
    } finally {
      setSearching(false);
    }
  };

  const handleAddUsuario = async (usuarioId: number) => {
    try {
      setError(null);
      await apiService.addParticipante({
        reserva_id: reservaId,
        usuario_id: usuarioId
      });
      await loadParticipantes();
      setSearchQuery('');
      setSearchResults([]);
      setShowAddForm(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao adicionar participante');
    }
  };

  const handleAddManual = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nomeManual.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    try {
      setError(null);
      await apiService.addParticipante({
        reserva_id: reservaId,
        nome_manual: nomeManual.trim()
      });
      await loadParticipantes();
      setNomeManual('');
      setShowAddForm(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao adicionar participante');
    }
  };

  const handleRemove = async (participanteId: number) => {
    if (!confirm('Deseja remover este participante?')) return;

    try {
      setError(null);
      await apiService.removeParticipante(participanteId);
      await loadParticipantes();
      if (onUpdate) onUpdate();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao remover participante');
    }
  };

  const getParticipanteNome = (p: Participante): string => {
    if (p.usuario) return p.usuario.nome;
    if (p.nome_manual) return p.nome_manual;
    return 'Nome não disponível';
  };

  const getParticipanteEmail = (p: Participante): string | null => {
    if (p.usuario) return p.usuario.email;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaUsers className="text-blue-600" />
          Participantes ({participantes.length})
        </h3>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setAddMode('usuario');
            setSearchQuery('');
            setSearchResults([]);
            setNomeManual('');
            setError(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaUserPlus />
          Adicionar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulário de adicionar */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setAddMode('usuario');
                setSearchQuery('');
                setSearchResults([]);
                setNomeManual('');
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                addMode === 'usuario'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Usuário Cadastrado
            </button>
            <button
              onClick={() => {
                setAddMode('manual');
                setSearchQuery('');
                setSearchResults([]);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                addMode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Nome Manual
            </button>
          </div>

          {addMode === 'usuario' ? (
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length < 2) {
                        setSearchResults([]);
                      }
                    }}
                    placeholder="Buscar usuário por nome ou email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchQuery.length < 2 || searching}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddManual} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nomeManual}
                  onChange={(e) => setNomeManual(e.target.value)}
                  placeholder="Digite o nome do participante..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          )}

          {/* Resultados da busca */}
          {addMode === 'usuario' && searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {searchResults.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    {usuario.foto_url ? (
                      <img
                        src={usuario.foto_url}
                        alt={usuario.nome}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{usuario.nome}</div>
                      <div className="text-sm text-gray-500">{usuario.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddUsuario(usuario.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setShowAddForm(false);
              setSearchQuery('');
              setSearchResults([]);
              setNomeManual('');
              setError(null);
            }}
            className="mt-4 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Lista de participantes */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Carregando...</p>
        </div>
      ) : participantes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaUsers className="text-3xl mx-auto mb-2 text-gray-400" />
          <p>Nenhum participante adicionado ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participantes.map((participante) => (
            <div
              key={participante.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {participante.usuario?.foto_url ? (
                  <img
                    src={participante.usuario.foto_url}
                    alt={getParticipanteNome(participante)}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {getParticipanteNome(participante)}
                  </div>
                  {getParticipanteEmail(participante) && (
                    <div className="text-sm text-gray-500">
                      {getParticipanteEmail(participante)}
                    </div>
                  )}
                  {participante.nome_manual && (
                    <div className="text-xs text-gray-400">Nome manual</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemove(participante.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover participante"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantesManager;

