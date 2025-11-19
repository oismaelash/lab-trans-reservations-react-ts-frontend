// Tipos para Locais
export interface Local {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Tipos para Salas
export interface Sala {
  id: number;
  local_id: number;
  nome: string;
  capacidade?: number | null;
  recursos?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Tipos para Reservas
export interface Reserva {
  id: number;
  local_id: number;
  sala_id: number;
  local?: string;
  local_nome?: string;
  sala?: string;
  sala_nome?: string;
  data_inicio: string;
  data_fim: string;
  responsavel: string;
  descricao?: string | null;
  cafe: boolean;
  quantidade_cafe?: number | null;
  criado_por_email?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Form types
export interface ReservaFormData {
  local_id: string;
  sala_id: string;
  data_inicio: string;
  data_fim: string;
  responsavel: string;
  descricao: string;
  cafe: boolean;
  quantidade_cafe: number;
}

export interface LocalFormData {
  nome: string;
  descricao: string;
  ativo: boolean;
}

export interface SalaFormData {
  local_id: string;
  nome: string;
  capacidade: string;
  recursos: string;
  ativo: boolean;
}

// API types
export interface ApiError {
  code: number;
  message: string;
  details?: unknown;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: 'admin' | 'user';
  };
}

// Filter types
export interface ReservaFilters {
  data_inicio?: string;
  data_fim?: string;
  sala?: string;
  local?: string;
  responsavel?: string;
  page?: number;
  page_size?: number;
}

export interface LocalFilters {
  ativo?: boolean;
}

export interface SalaFilters {
  local_id?: number;
  ativo?: boolean;
  capacidade_min?: number;
}

// User types
export interface Usuario {
  id: number;
  google_id: string;
  email: string;
  nome: string;
  foto_url?: string | null;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
}

// Tipos para Participantes
export interface Participante {
  id: number;
  reserva_id: number;
  usuario_id?: number | null;
  nome_manual?: string | null;
  created_at?: string;
  usuario?: Usuario | null;
}

