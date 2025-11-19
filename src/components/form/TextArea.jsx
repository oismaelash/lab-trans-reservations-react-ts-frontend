import { FaComment } from "react-icons/fa";

const TextArea = ({ label, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
        <FaComment className="text-indigo-500" />
        {label}
      </label>

      <div className="relative">
        <textarea
          {...props}
          rows={3}
          className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 resize-none hover:border-slate-300`}
        />
        <FaComment className="absolute left-3 top-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
};

export default TextArea;
