export default function CertificateBrandHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600">
        <div className="h-3.5 w-3.5 rounded-full bg-white" />
      </div>
      <span className="text-base font-bold text-emerald-800">
        Temu<span className="text-emerald-500">Dataku</span>
      </span>
    </div>
  );
}
