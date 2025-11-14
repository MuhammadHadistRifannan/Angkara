import { Search, CheckCircle, Ship, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Cari & Filter Kapal",
    description: "Pilih destinasi, tanggal, dan filter berdasarkan harga, kapasitas, atau rating",
  },
  {
    icon: CheckCircle,
    number: "02",
    title: "Lihat Detail & Review",
    description: "Cek profil operator, fasilitas kapal, dan ulasan terverifikasi dari penumpang lain",
  },
  {
    icon: Ship,
    number: "03",
    title: "Booking & Bayar DP",
    description: "Bayar DP 30% online atau pilih opsi pelunasan di dermaga - aman dengan escrow",
  },
  {
    icon: ThumbsUp,
    number: "04",
    title: "Nikmati Perjalanan",
    description: "Tunjukkan QR code tiket di dermaga dan nikmati pengalaman wisata yang aman",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cara Kerja SeaBook
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Booking kapal wisata kini semudah 4 langkah sederhana
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-accent opacity-20" />
              )}

              <div className="relative bg-card border-2 border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 bg-gradient-to-br from-primary to-accent text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-xl w-fit mb-4 mt-2">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
