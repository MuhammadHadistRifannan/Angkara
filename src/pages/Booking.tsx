import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Users, Clock, DollarSign, ArrowLeft, Compass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { mapBookingError } from "@/lib/bookingErrors";
import { formatDateWib, isDateInPastWib } from "@/lib/bookingDate";
import { DEMO_BOATS, findDemoBoat, findDemoPackage } from "@/lib/demoFallback";

interface BoatDetail {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  capacity: number;
  isDemo?: boolean;
}

interface PackageDetail {
  id: string;
  name: string;
  description: string | null;
  destination: string;
  durationLabel: string;
  price: number;
  unit: string;
  includes: string[];
  isDemo?: boolean;
  max_participants?: number | null;
  operator_id?: string | null;
  boat_id?: string | null;
}

export const BOAT_DESTINATIONS = [
  "Pantai Karang Bolong (Pulau Nusakambangan)",
  "Pantai Permisan (Pasir Putih Nusakambangan)",
  "Mercusuar Cimiring (Cagar Budaya Maritim 1870)",
  "Laguna Segara Anakan (Susur Mangrove)",
  "Kustom / Carter Bebas (Sesuai Kesepakatan)",
];

// Prefill tanggal dari ?date=YYYY-MM-DD (dari popup Cari Kapal).
// Dibangun sebagai tanggal lokal (bukan UTC) supaya tidak mundur sehari.
// Mengembalikan undefined bila kosong / tidak valid / sudah lewat.
const parseDateParam = (value: string | null): Date | undefined => {
  if (!value) return undefined;
  const parts = value.split("-").map((v) => parseInt(v, 10));
  if (parts.length !== 3 || parts.some((v) => !Number.isFinite(v))) {
    return undefined;
  }
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(d.getTime()) || isDateInPastWib(d)) return undefined;
  return d;
};

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // PERBAIKAN 2026-11-18: terima ketiga nama param yang dipakai di situs —
  // ?boat= (dari Armada), ?boatId= (nama lama), ?packageId= (dari Paket Tour).
  // Sebelumnya hanya "boatId" yang dibaca, sehingga "Pesan Sekarang" dari
  // Armada selalu membuka halaman dengan ringkasan pesanan kosong.
  const boatParam = searchParams.get("boatId") ?? searchParams.get("boat");
  const packageParam = searchParams.get("packageId");
  // Prefill dari popup Cari Kapal: ?date=YYYY-MM-DD&passengers=N.
  const dateParam = searchParams.get("date");
  const paxParam = searchParams.get("passengers");

  const [date, setDate] = useState<Date | undefined>(() =>
    parseDateParam(dateParam)
  );
  const [boat, setBoat] = useState<BoatDetail | null>(null);
  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [passengers, setPassengers] = useState<number | "">(() => {
    const n = parseInt(paxParam ?? "", 10);
    return Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : 1;
  });
  const [departureTime, setDepartureTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [destination, setDestination] = useState(BOAT_DESTINATIONS[0]);
  const [loading, setLoading] = useState(false);
  // Mode paket: kapal yang dipilih untuk paket ini. Daftar kapal asli dari
  // Supabase (bisa dipesan online) + 12 kapal demo sebagai pilihan.
  const [realBoats, setRealBoats] = useState<BoatDetail[]>([]);
  const [selectedBoatId, setSelectedBoatId] = useState(DEMO_BOATS[0].id);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (packageParam) {
        let found: PackageDetail | null = null;
        try {
          const { data } = await supabase
            .from("tour_packages")
            .select("id, name, description, duration_hours, price, includes, max_participants, operator_id, boat_id")
            .eq("id", packageParam)
            .single();
          if (data) {
            found = {
              id: data.id,
              name: data.name,
              description: data.description ?? null,
              destination: "",
              durationLabel:
                data.duration_hours != null ? `${data.duration_hours} jam` : "-",
              price: data.price,
              unit: "/ orang",
              includes: (data.includes as string[]) || [],
              isDemo: false,
              max_participants: data.max_participants ?? null,
              operator_id: data.operator_id ?? null,
              boat_id: (data as { boat_id?: string | null }).boat_id ?? null,
            };
          }
        } catch {
          // Supabase gagal / id tidak ada — jatuh ke data demo di bawah.
        }
        if (!found) {
          const demo = findDemoPackage(packageParam);
          if (demo) {
            found = {
              id: demo.id,
              name: demo.name,
              description: demo.description,
              destination: demo.destination,
              durationLabel: demo.durationLabel,
              price: demo.price,
              unit: demo.unit,
              includes: demo.includes,
              isDemo: true,
              max_participants: (demo as unknown as { max_participants?: number }).max_participants ?? 10,
              operator_id: null,
            };
          }
        }
        if (!cancelled) {
          setPkg(found);
          setLoaded(true);
        }
        return;
      }
      if (boatParam) {
        let found: BoatDetail | null = null;
        try {
          const { data } = await supabase
            .from("boats")
            .select("id, name, description, base_price, capacity")
            .eq("id", boatParam)
            .single();
          if (data) found = { ...(data as BoatDetail), isDemo: false };
        } catch {
          // Supabase gagal / id tidak ada — jatuh ke data demo di bawah.
        }
        if (!found) {
          const demo = findDemoBoat(boatParam);
          if (demo) {
            found = {
              id: demo.id,
              name: demo.name,
              description: demo.description,
              base_price: demo.base_price,
              capacity: demo.capacity,
              isDemo: true,
            };
          }
        }
        if (!cancelled) {
          setBoat(found);
          setLoaded(true);
        }
        return;
      }
      setLoaded(true);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [boatParam, packageParam]);

  // Mode paket: otomatis pasangkan armada kapal milik operator paket ini.
  // Wisatawan tidak perlu/tidak bisa memilih kapal sendiri karena paket
  // dan kapalnya sudah ditentukan/disetting oleh operator.
  useEffect(() => {
    if (!packageParam) return;
    let cancelled = false;
    (async () => {
      try {
        // 1. Jika paket memiliki boat_id yang telah ditentukan operator
        if (pkg?.boat_id) {
          const { data: bData } = await supabase
            .from("boats")
            .select("id, name, description, base_price, capacity")
            .eq("id", pkg.boat_id)
            .single();
          if (!cancelled && bData) {
            setRealBoats([bData as BoatDetail]);
            setSelectedBoatId(bData.id);
            return;
          }
        }

        // 2. Jika belum ada boat_id eksplisit, cari armada milik operator bersangkutan
        if (pkg?.operator_id) {
          const { data: opBoats } = await supabase
            .from("boats")
            .select("id, name, description, base_price, capacity")
            .eq("operator_id", pkg.operator_id)
            .eq("available", true);
          if (!cancelled && opBoats && opBoats.length > 0) {
            setRealBoats(opBoats as BoatDetail[]);
            setSelectedBoatId(opBoats[0].id);
            return;
          }
        }

        // 3. Fallback kapal tersedia umum jika tidak ada kecocokan
        const { data } = await supabase
          .from("boats")
          .select("id, name, description, base_price, capacity")
          .eq("available", true);
        if (!cancelled && data && data.length > 0) {
          setRealBoats(data as BoatDetail[]);
          setSelectedBoatId(data[0].id);
        }
      } catch {
        // Abaikan: daftar kapal demo tetap tampil.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [packageParam, pkg?.boat_id, pkg?.operator_id]);

  const selectedBoat =
    realBoats.find((b) => b.id === selectedBoatId) ||
    DEMO_BOATS.find((b) => b.id === selectedBoatId) ||
    null;
  // Kapal yang dipakai RPC: kapal di mode kapal, atau kapal pilihan di mode paket.
  const bookingBoatId = boat?.id ?? selectedBoatId;
  const bookingBoatIsDemo = boat
    ? !!boat.isDemo
    : !realBoats.some((b) => b.id === selectedBoatId);
  const effectiveCapacity = pkg
    ? Math.min(
        pkg.max_participants || 10,
        selectedBoat?.capacity || (pkg.max_participants || 10)
      )
    : (boat?.capacity ?? 100);

  // Pastikan jumlah penumpang tidak melebihi kapasitas kemampuan kapal yang diset operator
  useEffect(() => {
    const numPassengers = typeof passengers === "number" ? passengers : 1;
    if (effectiveCapacity > 0 && numPassengers > effectiveCapacity) {
      setPassengers(effectiveCapacity);
    }
  }, [effectiveCapacity, passengers]);
  const numPassengers = typeof passengers === "number" ? passengers : 1;
  const totalPrice = pkg
    ? pkg.unit === "/ orang"
      ? pkg.price * numPassengers
      : pkg.price
    : boat
      ? boat.base_price * numPassengers
      : 0;

  // Kembali ke Armada: ke halaman daftar kapal (/boats).
  // Sebelumnya: window.location.href = "/#armada-siap-berlayar" (muat ulang,
  // scroll anchor gagal → mendarat di atas landing), lalu navigate("/") +
  // scroll tertunda ke section landing — tapi Adin minta kembalinya ke
  // halaman /boats, bukan ke landing lagi.
  const goToFleet = () => {
    navigate("/boats");
  };

  const handleBooking = async () => {
    if (!date || (!boat && !pkg)) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    if (isDateInPastWib(date)) {
      toast.error("Tanggal keberangkatan sudah lewat.");
      return;
    }

    const finalPassengers = typeof passengers === "number" ? passengers : (parseInt(String(passengers), 10) || 1);
    if (finalPassengers < 1) {
      toast.error("Jumlah penumpang minimal 1 pax.");
      return;
    }

    if (finalPassengers > effectiveCapacity) {
      toast.error(
        `Jumlah penumpang melebihi kapasitas maksimal (${effectiveCapacity} pax) yang ditentukan.`
      );
      return;
    }

    // Kapal demo belum ada di database → RPC create_booking pasti menolak
    // (boat_unavailable). Beri tahu dengan jujur, jangan panggil RPC sia-sia.
    // Setelah seed demo dijalankan, kapal ini terdaftar dan pemesanan jalan.
    if (bookingBoatIsDemo) {
      toast.error(
        "Kapal ini belum terdaftar di sistem pemesanan online, jadi belum bisa dipesan. Silakan pilih kapal terdaftar dari daftar di atas."
      );
      return;
    }

    setLoading(true);
    try {
      const formattedDate = formatDateWib(date);
      const finalNotes = !pkg
        ? `Tujuan: ${destination}${notes.trim() ? ` · Catatan: ${notes.trim()}` : ""}`
        : (notes.trim() || null);

      const { error } = await supabase.rpc("create_booking", {
        p_boat_id: bookingBoatId,
        p_date: formattedDate,
        p_time: departureTime,
        p_passengers: finalPassengers,
        p_notes: finalNotes,
      });

      if (error) {
        const errorMsg = mapBookingError(error);
        toast.error(errorMsg);
        if (error.message?.includes("not_authenticated")) {
          navigate("/auth");
        }
        return;
      }

      toast.success("Booking berhasil dibuat!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(mapBookingError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* PERBAIKAN 2026-11-18: tombol kembali ke armada. Sebelumnya halaman
            Booking tidak punya jalan kembali ke daftar kapal / beranda selain
            lewat navbar. */}
        <Button
          variant="ghost"
          className="mb-4 -ml-2 text-slate-600 hover:text-slate-900"
          onClick={goToFleet}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Kembali ke Armada Kapal
        </Button>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-6">
              {pkg ? "Booking Paket Tour" : "Booking Kapal"}
            </h1>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Pilih Tanggal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => isDateInPastWib(d)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!pkg && (
                  <div>
                    <Label htmlFor="destination">Tujuan Penyeberangan</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Compass className="h-4 w-4 text-muted-foreground" />
                      <select
                        id="destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {BOAT_DESTINATIONS.map((dest) => (
                          <option key={dest} value={dest}>
                            {dest}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Pilih tujuan pelayaran atau penyeberangan Anda di perairan pesisir Cilacap.
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="passengers">Jumlah Penumpang</Label>
                    <span className="text-xs text-muted-foreground">
                      Maks. {effectiveCapacity} pax
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max={effectiveCapacity}
                      value={passengers}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          setPassengers("");
                          return;
                        }
                        const val = parseInt(raw, 10);
                        if (isNaN(val)) {
                          setPassengers("");
                        } else if (val > effectiveCapacity) {
                          setPassengers(effectiveCapacity);
                          toast.error(
                            `Kapasitas maksimal yang ditentukan adalah ${effectiveCapacity} pax`
                          );
                        } else {
                          setPassengers(val);
                        }
                      }}
                      onBlur={() => {
                        if (passengers === "" || passengers < 1) {
                          setPassengers(1);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Maksimal {effectiveCapacity} pax sesuai kapasitas {pkg ? "paket wisata yang disiapkan operator" : "kapal"}.
                  </p>
                </div>

                <div>
                  <Label htmlFor="time">Waktu Keberangkatan</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Tambahkan catatan untuk operator..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!loaded && (
                  <p className="text-sm text-muted-foreground">
                    Memuat detail pesanan…
                  </p>
                )}

                {loaded && !boat && !pkg && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Kapal atau paket yang dipilih tidak ditemukan. Mungkin tautan
                      sudah kedaluwarsa atau datanya belum tersedia.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={goToFleet}
                    >
                      Lihat Armada Kapal
                    </Button>
                  </div>
                )}

                {boat && (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg">{boat.name}</h3>
                      <p className="text-sm text-muted-foreground">{boat.description}</p>
                    </div>

                    <div className="space-y-2 py-4 border-y">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harga per pax</span>
                        <span>Rp {boat.base_price.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jumlah penumpang</span>
                        <span>{passengers || 1} pax</span>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-muted-foreground shrink-0">Tujuan</span>
                        <span className="font-medium text-slate-800 text-right leading-snug break-words">
                          {destination}
                        </span>
                      </div>
                      {date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tanggal</span>
                          <span>{date.toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Waktu</span>
                        <span>{departureTime}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Pembayaran DP 30%</p>
                          <p className="text-muted-foreground">
                            Bayar DP: Rp {(totalPrice * 0.3).toLocaleString('id-ID')}
                          </p>
                          <p className="text-muted-foreground">
                            Pelunasan di lokasi: Rp {(totalPrice * 0.7).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="hero"
                      className="w-full"
                      size="lg"
                      onClick={handleBooking}
                      disabled={loading || !date}
                    >
                      {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
                    </Button>
                    {!date && !loading && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Pilih tanggal berlayar di atas untuk melanjutkan ke pembayaran.
                      </p>
                    )}
                  </>
                )}

                {pkg && (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      {pkg.destination && (
                        <p className="text-sm text-muted-foreground">
                          Tujuan: {pkg.destination} · Durasi: {pkg.durationLabel}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                      {pkg.includes.length > 0 && (
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                          {pkg.includes.map((item, idx) => (
                            <li key={idx}>✓ {item}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="space-y-2 py-4 border-y">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harga paket</span>
                        <span>
                          Rp {pkg.price.toLocaleString('id-ID')} {pkg.unit}
                        </span>
                      </div>
                      {(pkg.unit === "/ orang" || pkg.unit === "/ pax") && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jumlah penumpang</span>
                          <span>{passengers || 1} pax (maks. {effectiveCapacity})</span>
                        </div>
                      )}
                      {pkg.destination && (
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-muted-foreground shrink-0">Tujuan</span>
                          <span className="font-medium text-slate-800 text-right leading-snug break-words">
                            {pkg.destination}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Armada Kapal</span>
                        <span className="font-medium text-slate-800">
                          {selectedBoat ? `${selectedBoat.name} (Disiapkan Operator)` : "Disiapkan oleh Operator"}
                        </span>
                      </div>
                      {date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tanggal</span>
                          <span>{date.toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Waktu</span>
                        <span>{departureTime}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Pembayaran DP 30%</p>
                          <p className="text-muted-foreground">
                            Bayar DP: Rp {(totalPrice * 0.3).toLocaleString('id-ID')}
                          </p>
                          <p className="text-muted-foreground">
                            Pelunasan di lokasi: Rp {(totalPrice * 0.7).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="hero"
                      className="w-full"
                      size="lg"
                      onClick={handleBooking}
                      disabled={loading || !date}
                    >
                      {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
                    </Button>
                    {!date && !loading && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Pilih tanggal berlayar di atas untuk melanjutkan ke pembayaran.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
