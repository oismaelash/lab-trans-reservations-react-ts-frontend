import { 
  FaBuilding, 
  FaClock, 
  FaUser, 
  FaComment, 
  FaCoffee, 
  FaEdit, 
  FaTrash,
  FaCalendarDay,
  FaUsers
} from 'react-icons/fa';
import { 
  WiDaySunny, 
  WiRain, 
  WiDayCloudy,
  IconType
} from 'react-icons/wi';

interface ReservaCardData {
  id: number;
  local: string;
  sala: string;
  data_inicio: string;
  data_fim: string;
  responsavel: string;
  descricao?: string | null;
  cafe: boolean;
  quantidade_cafe?: number | null;
  criado_por_email?: string | null;
  status?: string;
}

interface ReservationCardProps {
  reserva: ReservaCardData;
  onEdit: () => void;
  onDelete: () => void;
  onManageParticipantes?: () => void;
  currentUserEmail?: string | null;
}

interface StatusInfo {
  status: string;
  color: string;
  icon: IconType;
  iconColor: string;
}

const ReservationCard = ({ reserva, onEdit, onDelete, onManageParticipantes, currentUserEmail }: ReservationCardProps) => {
  // Check if current user is the reservation creator
  const canEdit = currentUserEmail && reserva.criado_por_email && currentUserEmail === reserva.criado_por_email;
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusInfo = (reserva: ReservaCardData): StatusInfo => {
    const now = new Date();
    const start = new Date(reserva.data_inicio);
    const end = new Date(reserva.data_fim);
    const timeUntilStart = start.getTime() - now.getTime();
    
    if (now > end) {
      return { 
        status: 'Concluída', 
        color: 'bg-white/20 text-emerald-100 border-emerald-200/40',
        icon: WiDaySunny,
        iconColor: 'text-emerald-200'
      };
    }
    if (now >= start && now <= end) {
      return { 
        status: 'Em Andamento', 
        color: 'bg-white/20 text-lime-100 border-lime-200/40',
        icon: WiDaySunny,
        iconColor: 'text-lime-200'
      };
    }
    if (timeUntilStart < 3600000) { 
      return { 
        status: 'Em Breve', 
        color: 'bg-white/20 text-amber-100 border-amber-200/40',
        icon: WiDayCloudy,
        iconColor: 'text-amber-200'
      };
    }
    return { 
      status: 'Agendada', 
      color: 'bg-white/20 text-cyan-100 border-cyan-200/40',
      icon: WiRain,
      iconColor: 'text-cyan-200'
    };
  };

  const statusInfo = getStatusInfo(reserva);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden group">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaBuilding className="text-white/70" />
              <span className="font-semibold text-white/80">{reserva.local}</span>
            </div>
            <h3 className="text-xl font-bold">{reserva.sala}</h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
            <StatusIcon className={`text-lg ${statusInfo.iconColor}`} />
            <span>{statusInfo.status}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center shadow-sm">
            <FaCalendarDay className="text-indigo-600 text-lg" />
            <span className="text-xs font-bold text-slate-700 mt-1">
              {new Date(reserva.data_inicio).getDate()}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900">
              {formatDate(reserva.data_inicio)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FaClock className="text-slate-400" />
              <span>{formatTime(reserva.data_inicio)} - {formatTime(reserva.data_fim)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaUser className=" text-base" />
          </div>
          <div>
            <div className="text-sm text-slate-500">Responsável</div>
            <div className="font-medium text-slate-900">{reserva.responsavel}</div>
          </div>
        </div>

        {reserva.descricao && (
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
              <FaComment className=" text-sm" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-500">Descrição</div>
              <div className="text-sm text-slate-700 line-clamp-2">{reserva.descricao}</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaCoffee className=" text-base" />
          </div>
          <div>
            <div className="text-sm text-slate-500">Serviço de Café</div>
            <div className={`font-medium ${reserva.cafe ? 'text-emerald-600' : 'text-slate-400'}`}>
              {reserva.cafe ? `Para ${reserva.quantidade_cafe} pessoas` : 'Não solicitado'}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          {onManageParticipantes && (
            <button 
              onClick={onManageParticipantes}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
            >
              <FaUsers />
              Participantes
            </button>
          )}
          {canEdit && (
            <>
              <button 
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium"
              >
                <FaEdit />
                Editar
              </button>
              <button 
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 font-medium"
              >
                <FaTrash />
                Excluir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;

