export default function UnderConstruction({ label }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">🚧</div>
        <h1 className="text-2xl font-semibold text-gray-900">{label}</h1>
        <p className="mt-2 text-gray-500">
          Cette section est en cours de développement et sera disponible dans un prochain sprint.
        </p>
        <span className="mt-5 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          TODO — Prochain sprint
        </span>
      </div>
    </div>
  );
}