import type { 
  Local, 
  Sala, 
  Reserva, 
  ApiError, 
  AuthResponse,
  ReservaFilters,
  LocalFilters,
  SalaFilters,
  LocalFormData,
  SalaFormData,
  Usuario,
  Participante
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper function to get headers with authentication
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper function for HTTP error handling
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: { message?: string; detail?: string; code?: string; details?: unknown };
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    
    // More specific messages for database errors
    let message = errorData.message || errorData.detail || response.statusText;
    if (errorData.code === "DATABASE_ERROR") {
      if (errorData.message?.includes("conectar") || errorData.message?.includes("banco de dados")) {
        message = "Erro ao conectar com o banco de dados. Verifique se o serviço está rodando.";
      } else {
        message = errorData.message || "Erro no banco de dados. Tente novamente mais tarde.";
      }
    }
    
    const error: ApiError = {
      code: response.status,
      message: message,
      details: errorData.details || errorData
    };
    
    throw error;
  }
  
    // If response is 204 No Content, return null
    if (response.status === 204) {
    return null as T;
  }
  
  return await response.json() as T;
};

export const apiService = {
  // GET - Locais
  async getLocais(params: LocalFilters = {}): Promise<Local[]> {
    const queryParams = new URLSearchParams();
    if (params.ativo !== undefined) queryParams.append('ativo', params.ativo.toString());
    
    const url = `${API_BASE_URL}/locais${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);
    const data = await handleResponse<Local[] | { items?: Local[]; results?: Local[] }>(response);
    return Array.isArray(data) ? data : data.items || data.results || [];
  },

  // GET - Local por ID
  async getLocalById(id: number): Promise<Local> {
    const response = await fetch(`${API_BASE_URL}/locais/${id}`);
    return handleResponse<Local>(response);
  },

  // POST - Criar Local
  async createLocal(localData: LocalFormData): Promise<Local> {
    const response = await fetch(`${API_BASE_URL}/locais`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localData)
    });
    return handleResponse<Local>(response);
  },

  // PUT - Atualizar Local
  async updateLocal(id: number, localData: Partial<LocalFormData>): Promise<Local> {
    const response = await fetch(`${API_BASE_URL}/locais/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localData)
    });
    return handleResponse<Local>(response);
  },

  // DELETE - Deletar Local
  async deleteLocal(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/locais/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<void>(response);
  },

  // GET - Salas
  async getSalas(params: SalaFilters = {}): Promise<Sala[]> {
    const queryParams = new URLSearchParams();
    if (params.local_id) queryParams.append('local_id', params.local_id.toString());
    if (params.ativo !== undefined) queryParams.append('ativo', params.ativo.toString());
    if (params.capacidade_min) queryParams.append('capacidade_min', params.capacidade_min.toString());
    
    const url = `${API_BASE_URL}/salas${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);
    const data = await handleResponse<Sala[] | { items?: Sala[]; results?: Sala[] }>(response);
    return Array.isArray(data) ? data : data.items || data.results || [];
  },

  // GET - Sala por ID
  async getSalaById(id: number): Promise<Sala> {
    const response = await fetch(`${API_BASE_URL}/salas/${id}`);
    return handleResponse<Sala>(response);
  },

  // POST - Criar Sala
  async createSala(salaData: Omit<SalaFormData, 'capacidade'> & { capacidade?: number | null }): Promise<Sala> {
    const response = await fetch(`${API_BASE_URL}/salas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salaData)
    });
    return handleResponse<Sala>(response);
  },

  // PUT - Atualizar Sala
  async updateSala(id: number, salaData: Partial<Omit<SalaFormData, 'capacidade'> & { capacidade?: number | null }>): Promise<Sala> {
    const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salaData)
    });
    return handleResponse<Sala>(response);
  },

  // DELETE - Deletar Sala
  async deleteSala(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<void>(response);
  },

  // GET - Reservas com filtros
  async getReservations(params: ReservaFilters = {}): Promise<Reserva[]> {
    const queryParams = new URLSearchParams();
    if (params.data_inicio) queryParams.append('data_inicio', params.data_inicio);
    if (params.data_fim) queryParams.append('data_fim', params.data_fim);
    if (params.sala) queryParams.append('sala', params.sala);
    if (params.local) queryParams.append('local', params.local);
    if (params.responsavel) queryParams.append('responsavel', params.responsavel);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    
    const url = `${API_BASE_URL}/reservas${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);
    const data = await handleResponse<Reserva[] | { items?: Reserva[]; results?: Reserva[] }>(response);
    return Array.isArray(data) ? data : data.items || data.results || [];
  },

  // GET - Reserva por ID
  async getReservationById(id: number): Promise<Reserva> {
    const response = await fetch(`${API_BASE_URL}/reservas/${id}`);
    return handleResponse<Reserva>(response);
  },

  // POST - Criar Reserva
  async createReservation(reservaData: {
    local_id: number;
    sala_id: number;
    local: string;
    sala: string;
    data_inicio: string;
    data_fim: string;
    responsavel: string;
    descricao?: string;
    cafe: boolean;
    quantidade_cafe?: number | null;
  }): Promise<Reserva> {
    const response = await fetch(`${API_BASE_URL}/reservas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        local_id: reservaData.local_id,
        sala_id: reservaData.sala_id,
        local: reservaData.local,
        sala: reservaData.sala,
        data_inicio: reservaData.data_inicio,
        data_fim: reservaData.data_fim,
        responsavel: reservaData.responsavel,
        descricao: reservaData.descricao || '',
        cafe: reservaData.cafe || false,
        quantidade_cafe: reservaData.cafe ? (reservaData.quantidade_cafe || null) : null
      })
    });
    
    return handleResponse<Reserva>(response);
  },
  
  // PUT - Atualizar Reserva
  async updateReservation(id: number, reservaData: {
    local_id: number;
    sala_id: number;
    local: string;
    sala: string;
    data_inicio: string;
    data_fim: string;
    responsavel: string;
    descricao?: string;
    cafe: boolean;
    quantidade_cafe?: number | null;
  }): Promise<Reserva> {
    const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        local_id: reservaData.local_id,
        sala_id: reservaData.sala_id,
        local: reservaData.local,
        sala: reservaData.sala,
        data_inicio: reservaData.data_inicio,
        data_fim: reservaData.data_fim,
        responsavel: reservaData.responsavel,
        descricao: reservaData.descricao || '',
        cafe: reservaData.cafe || false,
        quantidade_cafe: reservaData.cafe ? (reservaData.quantidade_cafe || null) : null
      })
    });
    
    return handleResponse<Reserva>(response);
  },

  // DELETE - Deletar Reserva
  async deleteReservation(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse<void>(response);
  },

  // Authentication
  async loginWithGoogle(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    return handleResponse<AuthResponse>(response);
  },

  // GET - Users (admin only)
  async getUsuarios(search?: string, skip: number = 0, limit: number = 100): Promise<Usuario[]> {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    queryParams.append('skip', skip.toString());
    queryParams.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/usuarios?${queryParams}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<Usuario[]>(response);
  },

  // GET - Search users (for selection)
  async searchUsuarios(q: string, limit: number = 20): Promise<Usuario[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', q);
    queryParams.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/usuarios/search?${queryParams}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<Usuario[]>(response);
  },

  // GET - Participantes de uma reserva
  async getParticipantes(reservaId: number): Promise<Participante[]> {
    const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}/participantes`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Participante[]>(response);
  },

  // POST - Adicionar participante
  async addParticipante(participante: {
    reserva_id: number;
    usuario_id?: number;
    nome_manual?: string;
  }): Promise<Participante> {
    const response = await fetch(`${API_BASE_URL}/participantes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(participante)
    });
    return handleResponse<Participante>(response);
  },

  // DELETE - Remover participante
  async removeParticipante(participanteId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/participantes/${participanteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<void>(response);
  }
};

