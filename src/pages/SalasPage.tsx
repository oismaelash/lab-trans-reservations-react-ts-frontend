import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { FaDoorOpen, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaBuilding } from 'react-icons/fa';
import { useSalas } from '../hooks/useSalas';
import { useLocais } from '../hooks/useLocais';
import { apiService } from '../services/api';
import { useModal } from '../context/ModalContext';
import type { Sala, ApiError, SalaFormData } from '../types';

const SalasPage = () => {
  const { salas, loading, error, refetch } = useSalas();
  const { locais } = useLocais({ ativo: true });
  const {
    modals,
    openSalaForm,
    closeSalaForm,
    openSalaDelete,
    closeSalaDelete,
  } = useModal();
  const [formData, setFormData] = useState<SalaFormData>({ 
    local_id: '', 
    nome: '', 
    capacidade: '', 
    recursos: '', 
    ativo: true 
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [filtroLocal, setFiltroLocal] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.local_id) {
      setFormError('O local é obrigatório');
      return;
    }

    if (!formData.nome.trim()) {
      setFormError('O nome é obrigatório');
      return;
    }

    if (formData.nome.length > 100) {
      setFormError('O nome não pode ter mais de 100 caracteres');
      return;
    }

    if (formData.capacidade && parseInt(formData.capacidade) <= 0) {
      setFormError('A capacidade deve ser maior que zero');
      return;
    }

    try {
      const payload = {
        local_id: parseInt(formData.local_id),
        nome: formData.nome,
        capacidade: formData.capacidade ? parseInt(formData.capacidade) : null,
        recursos: formData.recursos || null,
        ativo: formData.ativo
      };

      if (modals.salaForm.data) {
        await apiService.updateSala(modals.salaForm.data.id, payload);
        setSuccess('Sala atualizada com sucesso!');
      } else {
        await apiService.createSala(payload);
        setSuccess('Sala criada com sucesso!');
      }
      await refetch();
      closeSalaForm();
      setFormData({ local_id: '', nome: '', capacidade: '', recursos: '', ativo: true });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 409) {
        setFormError('Já existe uma sala com este nome neste local');
      } else {
        setFormError(apiError.message || 'Erro ao salvar sala');
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      if (!modals.salaDelete.data) {
        return;
      }
      await apiService.deleteSala(modals.salaDelete.data.id);
      await refetch();
      closeSalaDelete();
      setSuccess('Sala excluída com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  const openEditForm = (sala: Sala): void => {
    openSalaForm(sala);
  };

  // Preencher form quando modals.salaForm.data mudar
  useEffect(() => {
    if (modals.salaForm.data) {
      setFormData({
        local_id: modals.salaForm.data.local_id?.toString() || '',
        nome: modals.salaForm.data.nome,
        capacidade: modals.salaForm.data.capacidade?.toString() || '',
        recursos: modals.salaForm.data.recursos || '',
        ativo: modals.salaForm.data.ativo !== undefined ? modals.salaForm.data.ativo : true
      });
    } else if (modals.salaForm.isOpen && !modals.salaForm.data) {
      // Limpar form quando abrir para criar nova sala
      setFormData({ local_id: '', nome: '', capacidade: '', recursos: '', ativo: true });
    }
  }, [modals.salaForm.data, modals.salaForm.isOpen]);

  const salasFiltradas = filtroLocal 
    ? salas.filter((sala: Sala) => sala.local_id === parseInt(filtroLocal))
    : salas;

  const getLocalNome = (localId: number): string => {
    const local = locais.find(l => l.id === localId);
    return local?.nome || '-';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Salas</h1>
            <p className="text-gray-600 mt-1">Gerencie as salas disponíveis para reservas</p>
          </div>
          <button
            onClick={() => {
              openSalaForm();
              setFormData({ local_id: '', nome: '', capacidade: '', recursos: '', ativo: true });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <FaPlus />
            Nova Sala
          </button>
        </div>

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filtro */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Local</label>
          <select
            value={filtroLocal}
            onChange={(e) => setFiltroLocal(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os locais</option>
            {locais.map(local => (
              <option key={local.id} value={local.id}>{local.nome}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Local</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Capacidade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Recursos</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Nenhuma sala cadastrada
                  </td>
                </tr>
              ) : (
                salasFiltradas.map(sala => (
                  <tr key={sala.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400" />
                        <span className="text-gray-900">{getLocalNome(sala.local_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaDoorOpen className="text-gray-400" />
                        <span className="font-medium text-gray-900">{sala.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {sala.capacidade ? `${sala.capacidade} pessoas` : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {sala.recursos || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        sala.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sala.ativo ? <FaCheck /> : <FaTimes />}
                        {sala.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(sala)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openSalaDelete(sala)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulário */}
      {modals.salaForm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{modals.salaForm.data ? 'Editar Sala' : 'Nova Sala'}</h2>
              <button onClick={closeSalaForm} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Local *</label>
                <select
                  value={formData.local_id}
                  onChange={(e) => setFormData({ ...formData, local_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um local</option>
                  {locais.map(local => (
                    <option key={local.id} value={local.id}>{local.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recursos</label>
                <textarea
                  value={formData.recursos}
                  onChange={(e) => setFormData({ ...formData, recursos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ex: TV, projetor, videoconferência"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">Ativo</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeSalaForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modals.salaForm.data ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modals.salaDelete.isOpen && modals.salaDelete.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a sala "{modals.salaDelete.data.nome}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeSalaDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalasPage;

