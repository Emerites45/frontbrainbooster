// components/UnderConstruction.jsx
function UnderConstruction({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
      <div className="text-[15px] font-medium text-slate-700">{label}</div>
      <div className="text-[13px] text-slate-400 mt-1">En cours de production</div>
    </div>
  );
}
export default UnderConstruction;