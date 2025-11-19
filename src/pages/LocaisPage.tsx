import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { useLocais } from '../hooks/useLocais';
import { apiService } from '../services/api';
import { useModal } from '../context/ModalContext';
import type { Local, ApiError, LocalFormData } from '../types';

const LocaisPage = () => {
  const { locais, loading, error, refetch } = useLocais();
  const {
    modals,
    openLocalForm,
    closeLocalForm,
    openLocalDelete,
    closeLocalDelete,
  } = useModal();
  const [formData, setFormData] = useState<LocalFormData>({ nome: '', descricao: '', ativo: true });
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nome.trim()) {
      setFormError('O nome é obrigatório');
      return;
    }

    if (formData.nome.length > 100) {
      setFormError('O nome não pode ter mais de 100 caracteres');
      return;
    }

    try {
      if (modals.localForm.data) {
        await apiService.updateLocal(modals.localForm.data.id, formData);
        setSuccess('Local atualizado com sucesso!');
      } else {
        await apiService.createLocal(formData);
        setSuccess('Local criado com sucesso!');
      }
      await refetch();
      closeLocalForm();
      setFormData({ nome: '', descricao: '', ativo: true });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === 409) {
        setFormError('Já existe um local com este nome');
      } else {
        setFormError(apiError.message || 'Erro ao salvar local');
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      if (!modals.localDelete.data) {
        return;
      }
      await apiService.deleteLocal(modals.localDelete.data.id);
      await refetch();
      closeLocalDelete();
      setSuccess('Local excluído com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  const openEditForm = (local: Local): void => {
    openLocalForm(local);
  };

  // Preencher form quando modals.localForm.data mudar
  useEffect(() => {
    if (modals.localForm.data) {
      setFormData({
        nome: modals.localForm.data.nome,
        descricao: modals.localForm.data.descricao || '',
        ativo: modals.localForm.data.ativo !== undefined ? modals.localForm.data.ativo : true
      });
    } else if (modals.localForm.isOpen && !modals.localForm.data) {
      // Limpar form quando abrir para criar novo local
      setFormData({ nome: '', descricao: '', ativo: true });
    }
  }, [modals.localForm.data, modals.localForm.isOpen]);

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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Locais</h1>
            <p className="text-gray-600 mt-1">Gerencie os locais disponíveis para reservas</p>
          </div>
          <button
            onClick={() => {
              openLocalForm();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <FaPlus />
            Novo Local
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Descrição</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locais.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    Nenhum local cadastrado
                  </td>
                </tr>
              ) : (
                locais.map(local => (
                  <tr key={local.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400" />
                        <span className="font-medium text-gray-900">{local.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {local.descricao || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        local.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {local.ativo ? <FaCheck /> : <FaTimes />}
                        {local.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(local)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openLocalDelete(local)}
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
      {modals.localForm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{modals.localForm.data ? 'Editar Local' : 'Novo Local'}</h2>
              <button onClick={closeLocalForm} className="text-gray-400 hover:text-gray-600">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">Ativo</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeLocalForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modals.localForm.data ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modals.localDelete.isOpen && modals.localDelete.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o local "{modals.localDelete.data.nome}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeLocalDelete}
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

export default LocaisPage;

