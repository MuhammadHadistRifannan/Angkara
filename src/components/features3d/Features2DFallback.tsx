import { MAIN_FEATURES_3D, SECONDARY_FEATURES } from "./data";
import { Card, CardContent } from "@/components/ui/card";

export const Features2DFallback = () => {
  const allFeatures = [
    ...MAIN_FEATURES_3D.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      icon: f.icon,
    })),
    ...SECONDARY_FEATURES.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      icon: f.icon,
    })),
  ];

  return (
    <div className="w-full bg-[hsl(var(--features-bg-top))] pt-36 sm:pt-40 pb-16 text-white min-h-[600px]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 mb-4 tracking-[0.18em] uppercase">
            Fitur Utama Angkara
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-semibold tracking-[-0.03em] leading-[1.12] mb-4 text-white">
            <span>Lima alasan </span>
            <span className="text-white/70">berlayar tanpa ragu.</span>
          </h2>
          <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto">
            Dari verifikasi sampai pembayaran, semuanya terjaga.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="border border-slate-800 bg-slate-900/60 backdrop-blur-md hover:border-cyan-500/50 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-cyan-500 to-sky-600 p-3 rounded-lg w-fit mb-4 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
