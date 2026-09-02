function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="flex items-center justify-center rounded-2xl bg-slate-100 w-14 h-14 mb-4">
          <Icon size={24} className="text-slate-400" />
        </div>
      )}
      <p className="text-[14px] font-medium text-slate-600">{title}</p>
      {description && <p className="text-[13px] text-slate-400 mt-1 max-w-[360px]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;