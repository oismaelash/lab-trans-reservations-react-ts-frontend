import { FaExclamationTriangle } from "react-icons/fa";

const TextInput = ({ label, icon: Icon, error, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
        <Icon className="text-indigo-500" />
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all ${
            error ? "border-rose-400 bg-rose-50" : "border-slate-200 hover:border-slate-300"
          }`}
        />
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {error && (
        <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
          <FaExclamationTriangle /> {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;
