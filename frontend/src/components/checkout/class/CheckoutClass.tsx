import CheckoutClassForm from "./CheckoutClassForm";
import CheckoutSummary from "../CheckoutSummary";
import CheckoutClassTerms from "./CheckoutClassTerms";

export default function CheckoutClassPage() {
  return (
    <div className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Kolom Kiri (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-1">
          <CheckoutClassForm />
          <CheckoutClassTerms />
        </div>

        {/* Kolom Kanan (1/3) */}
        <div className="pr-9 pb-18">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}
