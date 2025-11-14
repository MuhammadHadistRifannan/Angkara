import { Shield, Calendar, Calculator, FileText, Cloud, CreditCard, Star, MessageCircle, Package, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Listing Terverifikasi",
    description: "Semua operator kapal terverifikasi KSOP dengan dokumen lengkap dan badge resmi",
  },
  {
    icon: Calendar,
    title: "Kalender Booking",
    description: "Sistem minimal penumpang otomatis dan opsi sharing trip untuk efisiensi maksimal",
  },
  {
    icon: Calculator,
    title: "Kalkulator Tarif",
    description: "Estimasi biaya transparan dengan breakdown detail - tidak ada biaya tersembunyi",
  },
  {
    icon: FileText,
    title: "Informasi Izin",
    description: "Panduan lengkap regulasi KSOP dan checklist izin untuk setiap rute perjalanan",
  },
  {
    icon: Cloud,
    title: "Peringatan Cuaca",
    description: "Data BMKG real-time dengan notifikasi keselamatan untuk setiap trip",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Online",
    description: "DP 30% online via e-wallet, escrow system untuk keamanan transaksi",
  },
  {
    icon: Star,
    title: "Rating Terverifikasi",
    description: "Ulasan post-trip dengan verifikasi GPS dan foto untuk transparansi penuh",
  },
  {
    icon: MessageCircle,
    title: "Chat Real-time",
    description: "Komunikasi langsung dengan operator plus terjemahan otomatis untuk wisatawan asing",
  },
  {
    icon: Package,
    title: "Paket Wisata",
    description: "Paket siap pakai dengan durasi fleksibel - sunset tour, edukasi, keliling pulau",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analitik",
    description: "Laporan lengkap untuk operator dan pemerintah dengan data real-time",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Fitur Lengkap untuk Pengalaman Terbaik
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            10 fitur utama yang dirancang khusus untuk mengatasi tantangan booking kapal wisata di Cilacap
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card"
            >
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
