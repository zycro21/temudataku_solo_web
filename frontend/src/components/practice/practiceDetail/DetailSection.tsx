import { Clock, LayoutGrid, Database } from 'lucide-react';

export default function DetailSection() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-4 mb-8 px-4 max-w-7xl mx-auto">
            {/* Stat 1 - Time estimation */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-sm p-6 w-full">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7 text-emerald-500" />
                </div>
                <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-gray-900 mb-1">100</div>
                    <div className="text-sm text-gray-600 leading-tight">
                        Menit estimasi pengerjaan<br />latihan ini
                    </div>
                </div>
            </div>

            {/* Stat 2 - Tools/Applications */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-sm p-6 w-full">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <LayoutGrid className="w-7 h-7 text-emerald-500" />
                </div>
                <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-gray-900 mb-1">5</div>
                    <div className="text-sm text-gray-600 leading-tight">
                        Alat atau aplikasi yang kamu<br />butuhkan untuk latihan ini
                    </div>
                </div>
            </div>

            {/* Stat 3 - Data rows */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-sm p-6 w-full">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Database className="w-7 h-7 text-emerald-500" />
                </div>
                <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        1.000+
                    </div>
                    <div className="text-sm text-gray-600 leading-tight">
                        Baris data yang bisa kamu<br />olah dan eksplor
                    </div>
                </div>
            </div>
        </div>
    );
}
