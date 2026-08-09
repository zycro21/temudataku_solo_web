export default function CertificateLoadingState() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
      <div className="h-40 bg-emerald-100" />
      <div className="space-y-6 px-6 py-8 sm:px-10">
        <div className="mx-auto h-6 w-48 rounded bg-gray-100" />
        <div className="h-24 rounded-2xl bg-emerald-50" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-16 rounded-xl bg-gray-100" />
          <div className="h-16 rounded-xl bg-gray-100" />
        </div>
        <div className="h-12 rounded-xl bg-gray-100" />
        <div className="h-11 rounded-xl bg-emerald-100" />
      </div>
    </div>
  );
}
