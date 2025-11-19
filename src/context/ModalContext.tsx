import { createContext, useContext, useState, ReactNode } from 'react';
import type { Local, Sala, ApiError } from '../types';

// Tipos para dados dos modais de Reserva
interface EditingReservation {
  id: number;
  local_id?: number;
  sala_id?: number;
  local?: string;
  sala?: string;
  data_inicio: string;
  data_fim: string;
  responsavel: string;
  descricao?: string | null;
  cafe?: boolean;
  quantidade_cafe?: number | null;
}

interface DeletingReservation {
  id: number;
  local: string;
  sala: string;
  data_inicio: string;
  data_fim: string;
  responsavel: string;
}

// Estado dos modais
interface ModalState {
  // Reservas
  reservationForm: {
    isOpen: boolean;
    mode: 'create' | 'edit' | null;
    data: EditingReservation | null;
    error: ApiError | null;
  };
  reservationDelete: {
    isOpen: boolean;
    data: DeletingReservation | null;
  };
  participantes: {
    isOpen: boolean;
    reservaId: number | null;
  };
  
  // Salas
  salaForm: {
    isOpen: boolean;
    data: Sala | null;
  };
  salaDelete: {
    isOpen: boolean;
    data: Sala | null;
  };
  
  // Locais
  localForm: {
    isOpen: boolean;
    data: Local | null;
  };
  localDelete: {
    isOpen: boolean;
    data: Local | null;
  };
}

// Context Actions
interface ModalContextType {
  // State
  modals: ModalState;
  
  // Reservas
  openReservationForm: (mode: 'create' | 'edit', data?: EditingReservation) => void;
  closeReservationForm: () => void;
  setReservationFormError: (error: ApiError | null) => void;
  
  openReservationDelete: (data: DeletingReservation) => void;
  closeReservationDelete: () => void;
  
  openParticipantes: (reservaId: number) => void;
  closeParticipantes: () => void;
  
  // Salas
  openSalaForm: (data?: Sala) => void;
  closeSalaForm: () => void;
  
  openSalaDelete: (data: Sala) => void;
  closeSalaDelete: () => void;
  
  // Locais
  openLocalForm: (data?: Local) => void;
  closeLocalForm: () => void;
  
  openLocalDelete: (data: Local) => void;
  closeLocalDelete: () => void;
  
  // Generic function to close all modals
  closeAllModals: () => void;
}

const initialState: ModalState = {
  reservationForm: {
    isOpen: false,
    mode: null,
    data: null,
    error: null,
  },
  reservationDelete: {
    isOpen: false,
    data: null,
  },
  participantes: {
    isOpen: false,
    reservaId: null,
  },
  salaForm: {
    isOpen: false,
    data: null,
  },
  salaDelete: {
    isOpen: false,
    data: null,
  },
  localForm: {
    isOpen: false,
    data: null,
  },
  localDelete: {
    isOpen: false,
    data: null,
  },
};

const ModalContext = createContext<ModalContextType | null>(null);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modals, setModals] = useState<ModalState>(initialState);

  // Reservas
  const openReservationForm = (mode: 'create' | 'edit', data?: EditingReservation) => {
    setModals(prev => ({
      ...prev,
      reservationForm: {
        isOpen: true,
        mode,
        data: data || null,
        error: null,
      },
    }));
  };

  const closeReservationForm = () => {
    setModals(prev => ({
      ...prev,
      reservationForm: {
        isOpen: false,
        mode: null,
        data: null,
        error: null,
      },
    }));
  };

  const setReservationFormError = (error: ApiError | null) => {
    setModals(prev => ({
      ...prev,
      reservationForm: {
        ...prev.reservationForm,
        error,
      },
    }));
  };

  const openReservationDelete = (data: DeletingReservation) => {
    setModals(prev => ({
      ...prev,
      reservationDelete: {
        isOpen: true,
        data,
      },
    }));
  };

  const closeReservationDelete = () => {
    setModals(prev => ({
      ...prev,
      reservationDelete: {
        isOpen: false,
        data: null,
      },
    }));
  };

  const openParticipantes = (reservaId: number) => {
    setModals(prev => ({
      ...prev,
      participantes: {
        isOpen: true,
        reservaId,
      },
    }));
  };

  const closeParticipantes = () => {
    setModals(prev => ({
      ...prev,
      participantes: {
        isOpen: false,
        reservaId: null,
      },
    }));
  };

  // Salas
  const openSalaForm = (data?: Sala) => {
    setModals(prev => ({
      ...prev,
      salaForm: {
        isOpen: true,
        data: data || null,
      },
    }));
  };

  const closeSalaForm = () => {
    setModals(prev => ({
      ...prev,
      salaForm: {
        isOpen: false,
        data: null,
      },
    }));
  };

  const openSalaDelete = (data: Sala) => {
    setModals(prev => ({
      ...prev,
      salaDelete: {
        isOpen: true,
        data,
      },
    }));
  };

  const closeSalaDelete = () => {
    setModals(prev => ({
      ...prev,
      salaDelete: {
        isOpen: false,
        data: null,
      },
    }));
  };

  // Locais
  const openLocalForm = (data?: Local) => {
    setModals(prev => ({
      ...prev,
      localForm: {
        isOpen: true,
        data: data || null,
      },
    }));
  };

  const closeLocalForm = () => {
    setModals(prev => ({
      ...prev,
      localForm: {
        isOpen: false,
        data: null,
      },
    }));
  };

  const openLocalDelete = (data: Local) => {
    setModals(prev => ({
      ...prev,
      localDelete: {
        isOpen: true,
        data,
      },
    }));
  };

  const closeLocalDelete = () => {
    setModals(prev => ({
      ...prev,
      localDelete: {
        isOpen: false,
        data: null,
      },
    }));
  };

  // Fechar todos os modais
  const closeAllModals = () => {
    setModals(initialState);
  };

  const value: ModalContextType = {
    modals,
    openReservationForm,
    closeReservationForm,
    setReservationFormError,
    openReservationDelete,
    closeReservationDelete,
    openParticipantes,
    closeParticipantes,
    openSalaForm,
    closeSalaForm,
    openSalaDelete,
    closeSalaDelete,
    openLocalForm,
    closeLocalForm,
    openLocalDelete,
    closeLocalDelete,
    closeAllModals,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

// Exportar tipos para uso em outros arquivos
export type { EditingReservation, DeletingReservation };

