import { Check, AlertCircle } from "lucide-react";

interface Props {
  benefit: any;
  closing: any;
}

export default function BenefitsSection({ benefit, closing }: Props) {
  const isLoading = !benefit;

  const benefits: string[] = benefit?.content?.items || [];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-emerald-600 font-medium text-xs uppercase tracking-widest mb-2">
            Yang Kamu Dapat
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Apa yang Kamu Dapatkan?
          </h2>
        </div>

        {/* Benefits */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-10 sm:mb-12 justify-items-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 w-full max-w-md bg-gray-100 rounded-xl border border-emerald-100"
              />
            ))}
          </div>
        ) : benefits.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 mb-12 justify-items-center">
            {benefits.map((b, i) => {
              const isOdd = benefits.length % 2 !== 0;
              const isLast = i === benefits.length - 1;

              return (
                <div
                  key={i}
                  className={`
    flex flex-col sm:flex-row gap-2 sm:gap-3 items-start
    bg-white border border-emerald-100 
    rounded-xl px-4 sm:px-5 py-3 sm:py-4 shadow-sm hover:shadow-md transition
    w-full max-w-md
    ${isOdd && isLast ? "col-span-2 justify-self-center" : ""}
  `}
                >
                  <Check
                    size={18}
                    className="text-emerald-600 shrink-0 self-center sm:self-start sm:mt-1"
                  />
                  <p className="text-gray-700 font-medium text-sm leading-relaxed text-center sm:text-left">
                    {b}
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex gap-3 items-start sm:items-start shadow-sm mb-8 sm:mb-10">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />

          <div>
            <p className="font-semibold text-gray-800 text-sm mb-1 text-left sm:text-left">
              Hal yang Perlu Kamu Tahu
            </p>

            <p className="text-gray-600 font-medium text-sm leading-relaxed">
              Program ini <strong>tidak menjanjikan hasil instan</strong> atau
              langsung menjadi expert dalam waktu singkat. Namun, program ini
              dirancang untuk memberikan{" "}
              <strong>fondasi yang kuat, materi yang relevan,</strong> dan
              pengalaman belajar yang lebih terarah.
            </p>
          </div>
        </div>

        {/* Closing Section (NEW) */}
        {closing && (
          <div className="relative bg-white border border-emerald-100 rounded-2xl p-5 sm:p-7 text-center shadow-sm overflow-hidden">
            {/* subtle gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-white pointer-events-none" />

            {/* content */}
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Jadi, Bagaimana Keputusanmu Sekarang?
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed max-w-xl mx-auto px-2 sm:px-0">
                {closing?.content?.text || ""}
              </p>

              {/* accent line */}
              <div className="mt-6 flex justify-center">
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
