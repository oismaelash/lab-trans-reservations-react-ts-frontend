import { useState, useEffect, FormEvent } from 'react';
import { FaUsers, FaSearch, FaEnvelope, FaUser, FaCalendar } from 'react-icons/fa';
import { apiService } from '../services/api';
import type { Usuario, ApiError } from '../types';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const limit = 50;

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUsuarios(search || undefined, currentPage * limit, limit);
      setUsuarios(data);
      // Since API doesn't return total, assume there's more if it returned the limit
      setTotal(data.length === limit ? (currentPage + 1) * limit + 1 : (currentPage * limit) + data.length);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 403) {
        setError('Você não tem permissão para acessar esta página');
      } else {
        setError(apiError.message || 'Erro ao carregar usuários');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [currentPage, search]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(0);
    loadUsuarios();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaUsers className="text-blue-600" />
          Gerenciamento de Usuários
        </h1>
        <p className="text-gray-600 mt-2">Visualize todos os usuários que fizeram login na plataforma</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Barra de busca */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Lista de usuários */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastrado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Login
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {usuario.foto_url ? (
                            <img
                              src={usuario.foto_url}
                              alt={usuario.nome}
                              className="h-10 w-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <FaUser className="text-blue-600" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                            <div className="text-sm text-gray-500">ID: {usuario.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {usuario.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendar className="mr-2 text-gray-400" />
                          {formatDate(usuario.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendar className="mr-2 text-gray-400" />
                          {formatDate(usuario.last_login_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginação */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando {usuarios.length} usuário(s)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={usuarios.length < limit}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsuariosPage;

