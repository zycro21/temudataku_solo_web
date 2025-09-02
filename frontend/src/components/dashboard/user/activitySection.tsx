export default function ActivitySection() {
  const activities = [
    { title: "Data Science Class", status: "Pengumpulan" },
    { title: "Data Science Class", status: "Materi" },
    { title: "Python Short Class", status: "Materi" },
    // { title: "Machine Learning Workshop", status: "Pengumpulan" },
    // { title: "AI for Healthcare", status: "Materi" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      {/* Header section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Aktivitas Terkini
        </h2>
      </div>

      {/* Activity list with fixed height + scroll */}
      <div className="space-y-4 ml-3 h-[210px] max-h-[210px] overflow-y-auto pr-2 scroll-thin">
        {activities.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-100"
          >
            <div className="flex flex-col">
              <span className="text-base font-medium text-gray-800">
                {item.title}
              </span>
              <span className="text-sm text-gray-500 mt-1">{item.status}</span>
            </div>
            <button className="bg-emerald-500 text-white font-medium text-sm px-4 py-1.5 rounded-full hover:bg-emerald-600 transition-colors">
              Lihat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
