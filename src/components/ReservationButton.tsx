import { FaCalendarAlt } from "react-icons/fa";

interface ReservationButtonProps {
  onNewReservation: () => void;
}

export default function ReservationButton({ onNewReservation }: ReservationButtonProps) {
  return ( 
    <button 
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 hover:brightness-110 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-200/60"
      onClick={onNewReservation}
    >
      <FaCalendarAlt className="text-sm " />
      Nova Reserva
    </button>
  );
}

