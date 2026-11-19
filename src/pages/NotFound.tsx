import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Mascot } from "@/components/illustrations/Mascot";
import { ArrowLeft, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] text-slate-900 p-6 relative overflow-hidden">
      {/* Tekstur Peta Laut Halus */}
      <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden="true">
        <svg className="w-full h-full">
          <pattern id="notfound-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D6CEBE" strokeWidth="0.5" strokeDasharray="2,3" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#notfound-grid)" />
        </svg>
      </div>

      <div className="text-center max-w-md mx-auto relative z-10 bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        {/* Maskot Si Suar Berpikir */}
        <div className="mb-4 flex justify-center">
          <Mascot mood="thinking" size={120} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>Koordinat 404: Rute Di Luar Peta</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Jalur Pelayaran Tidak Ditemukan
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
          Sepertinya haluan kapal Anda tersesat di luar perairan Teluk Penyu dan Nusakambangan. Mari kembali ke dermaga resmi SUAR.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda SUAR</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
