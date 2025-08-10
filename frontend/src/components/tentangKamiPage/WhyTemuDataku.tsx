import { FileText } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet consectetur. Urna ornare quam facilisis elit est quam.",
  },
  {
    id: 2,
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet consectetur. Urna ornare quam facilisis elit est quam.",
  },
  {
    id: 3,
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet consectetur. Urna ornare quam facilisis elit est quam.",
  },
  {
    id: 4,
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet consectetur. Urna ornare quam facilisis elit est quam.",
  },
];

export default function WhyTemuDatakuSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-8 md:px-[100px]">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl  text-gray-900">Mengapa TemuDataku?</h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div key={feature.id} className=" space-y-4 bg-[#F8FAFC] rounded-lg p-8">
              {/* Icon */}
              <div className="flex justify-start mb-4">
                <div className="w-16 h-16 bg-[#0CA678] rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
