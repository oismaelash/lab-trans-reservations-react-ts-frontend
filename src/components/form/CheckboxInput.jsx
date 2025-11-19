const CheckboxInput = ({ label, icon: Icon, ...props }) => {
  return (
    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 cursor-pointer transition">
      <input type="checkbox" {...props} className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
      <div className="flex items-center gap-2">
        <Icon className="text-cyan-500" />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
    </label>
  );
};

export default CheckboxInput;
