export default function StatCard({ title, value, change, color, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-sm text-slate-400 font-medium mb-3">{title}</p>
      <div className={`text-xs font-bold ${color}`}>{change}</div>
    </div>
  );
}