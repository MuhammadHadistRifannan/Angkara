import { ArrowUpRight } from "lucide-react";
import type { SecondaryFeatureItem } from "./types";

interface SecondaryFeaturesProps {
  features: SecondaryFeatureItem[];
}

export const SecondaryFeatures = ({ features }: SecondaryFeaturesProps) => {
  return (
    <div className="mt-16 sm:mt-24 pt-12 border-t border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
            Ekosistem Maritim Lengkap
          </span>
          <h4 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Dan Masih Banyak Lagi
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Dirancang menyeluruh untuk keselamatan navigasi, transparansi operasional, dan kepuasan wisatawan bahari Cilacap.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item) => {
          const Icon = item.icon;
          const CardContent = (
            <div className="h-full p-5 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-cyan-400 mb-3.5 group-hover:scale-105 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h5 className="font-semibold text-base text-white mb-1.5 flex items-center justify-between">
                  <span>{item.title}</span>
                  {item.href && (
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  )}
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-2xl"
              >
                {CardContent}
              </a>
            );
          }

          return <div key={item.id}>{CardContent}</div>;
        })}
      </div>
    </div>
  );
};
