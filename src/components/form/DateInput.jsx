import { FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";

const DateInput = ({ label, error, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
        <FaCalendarAlt className="text-indigo-500" />
        {label}
      </label>

      <div className="relative">
        <input
          type="date"
          {...props}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 transition ${
            error ? "border-rose-400 bg-rose-50" : "border-slate-200 hover:border-slate-300"
          }`}
        />
        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {error && <p className="text-sm text-rose-600 mt-1 flex items-center gap-1"><FaExclamationTriangle /> {error}</p>}
    </div>
  );
};

export default DateInput;
