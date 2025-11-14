import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PermitInfo = () => {
  const permits = [
    {
      title: "Izin Operasional KSOP",
      required: true,
      description: "Surat izin operasional dari Kantor Kesyahbandaran dan Otoritas Pelabuhan",
      documents: [
        "Surat Permohonan Izin",
        "Akta Pendirian Perusahaan",
        "NPWP Perusahaan",
        "Sertifikat Kelaikan Kapal",
        "Pas Foto Direktur 4x6 (2 lembar)",
      ],
    },
    {
      title: "Sertifikat Keselamatan Kapal",
      required: true,
      description: "Dokumen yang menyatakan kapal layak dan aman untuk beroperasi",
      documents: [
        "Hasil Inspeksi Teknis Kapal",
        "Sertifikat Stabilitas",
        "Alat Keselamatan Lengkap",
        "Lifebuoy dan Life Jacket sesuai kapasitas",
      ],
    },
    {
      title: "Izin Trayek",
      required: true,
      description: "Penetapan rute perjalanan yang diizinkan untuk beroperasi",
      documents: [
        "Peta Rute Perjalanan",
        "Jadwal Operasional",
        "Persetujuan KSOP",
      ],
    },
    {
      title: "Asuransi Penumpang",
      required: true,
      description: "Perlindungan asuransi untuk penumpang selama perjalanan",
      documents: [
        "Polis Asuransi",
        "Bukti Pembayaran Premi",
        "Coverage Details",
      ],
    },
  ];

  const requirements = [
    "Operator harus memiliki badan usaha yang sah (CV/PT)",
    "Kapal harus lolos uji kelayakan dari KSOP",
    "Nahkoda dan ABK memiliki sertifikat kompetensi",
    "Alat keselamatan lengkap dan sesuai standar",
    "Asuransi penumpang aktif dan valid",
    "Laporan berkala kepada KSOP",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Informasi Izin & Regulasi
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Panduan lengkap perizinan dan regulasi untuk operator kapal wisata di Cilacap
          </p>
        </div>

        {/* Warning Alert */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Penting untuk Diketahui</h3>
                <p className="text-muted-foreground">
                  Semua operator kapal wisata WAJIB memiliki izin resmi dari KSOP (Kantor Kesyahbandaran dan Otoritas Pelabuhan) Cilacap. 
                  Operasi tanpa izin dapat dikenakan sanksi administratif hingga pidana sesuai UU No. 17 Tahun 2008 tentang Pelayaran.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permits List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Dokumen Izin yang Diperlukan</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {permits.map((permit, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-2 rounded-lg px-6">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    {permit.required ? (
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold">{permit.title}</div>
                      <div className="text-sm text-muted-foreground">{permit.description}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 pl-8">
                    <h4 className="font-semibold mb-3">Dokumen yang Diperlukan:</h4>
                    <ul className="space-y-2">
                      {permit.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Requirements */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Persyaratan Umum Operator
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{req}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2">Informasi Kontak KSOP Cilacap</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Alamat: Jl. Slamet Riyadi No. 1, Cilacap, Jawa Tengah</p>
                <p>Telepon: (0282) 532511</p>
                <p>Email: ksop.cilacap@dephub.go.id</p>
                <p>Jam Layanan: Senin-Jumat, 08:00-16:00 WIB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PermitInfo;
