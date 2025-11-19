import { FaExclamationTriangle, FaTimes, FaBuilding, FaClock, FaUser } from 'react-icons/fa';

interface ReservationData {
  id: number;
  local: string;
  sala: string;
  data_inicio: string;
  data_fim: string;
  responsavel: string;
}

interface DeleteModalProps {
  reservation: ReservationData;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal = ({ reservation, onClose, onConfirm }: DeleteModalProps) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 border border-slate-100">
        <div className="flex justify-between items-center p-6 border-b border-rose-100 bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
              <FaExclamationTriangle className="text-rose-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Confirmar Exclusão</h3>
              <p className="text-sm text-slate-500">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1 rounded-lg"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-600 mb-6">
            Tem certeza que deseja excluir permanentemente esta reserva?
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3 border border-slate-100">
            <div className="flex items-center gap-3">
              <FaBuilding className="text-indigo-500" />
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {reservation.local} - {reservation.sala}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FaClock className="text-indigo-500" />
              <div>
                <div className="text-sm text-slate-500">
                  {formatDate(reservation.data_inicio)}
                </div>
                <div className="text-sm text-slate-500">
                  {formatTime(reservation.data_inicio)} - {formatTime(reservation.data_fim)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaUser className="text-indigo-500" />
              <div className="text-sm text-slate-600">
                {reservation.responsavel}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all duration-200 font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:brightness-110 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-rose-200/60 flex items-center gap-2"
            >
              <FaTimes />
              Excluir Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

