import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  Compass,
  Ship,
  QrCode,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { mapBookingError } from "@/lib/bookingErrors";
import { formatDateWib, isDateInPastWib } from "@/lib/bookingDate";
import { DEMO_BOATS, findDemoBoat, findDemoPackage } from "@/lib/demoFallback";
import {
  CheckoutProgressBar,
} from "@/components/booking/CheckoutProgressBar";
import {
  PaymentMethodSelection,
} from "@/components/booking/PaymentMethodSelection";
import {
  type StepItem,
  type PaymentMethodId,
  type PaymentScheme,
  BOAT_DESTINATIONS,
  DEFAULT_CHECKOUT_STEPS as CHECKOUT_STEPS,
} from "@/components/booking/checkoutTypes";
import {
  loadMidtransSnapScript,
  requestSnapToken,
  openSnapPayment,
} from "@/lib/midtrans";

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
  const boatParam = searchParams.get("boatId") ?? searchParams.get("boat");
  const packageParam = searchParams.get("packageId");
  const dateParam = searchParams.get("date");
  const paxParam = searchParams.get("passengers");

  // Multi-step Checkout State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [paymentScheme, setPaymentScheme] = useState<PaymentScheme>("dp_30");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("midtrans_qris");
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

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
  const [realBoats, setRealBoats] = useState<BoatDetail[]>([]);
  const [selectedBoatId, setSelectedBoatId] = useState(DEMO_BOATS[0].id);

  // Preload Midtrans script on mount
  useEffect(() => {
    loadMidtransSnapScript().catch((err) => {
      console.warn("Midtrans script preload error:", err);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (packageParam) {
        let found: PackageDetail | null = null;
        try {
          const { data } = await supabase
            .from("tour_packages")
            .select(
              "id, name, description, duration_hours, price, includes, max_participants, operator_id, boat_id"
            )
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
          // Fallback to demo package
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
              max_participants:
                (demo as unknown as { max_participants?: number })
                  .max_participants ?? 10,
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
          // Fallback to demo boat
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

  useEffect(() => {
    if (!packageParam) return;
    let cancelled = false;
    (async () => {
      try {
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

        const { data } = await supabase
          .from("boats")
          .select("id, name, description, base_price, capacity")
          .eq("available", true);
        if (!cancelled && data && data.length > 0) {
          setRealBoats(data as BoatDetail[]);
          setSelectedBoatId(data[0].id);
        }
      } catch {
        // demo list fallback
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

  useEffect(() => {
    const num = typeof passengers === "number" ? passengers : 1;
    if (effectiveCapacity > 0 && num > effectiveCapacity) {
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

  const dpAmount = Math.round(totalPrice * 0.3);
  const payableAmount = paymentScheme === "dp_30" ? dpAmount : totalPrice;

  const goToFleet = () => {
    navigate("/boats");
  };

  const validateStep1 = (): boolean => {
    if (!date || (!boat && !pkg)) {
      toast.error("Mohon lengkapi semua data");
      return false;
    }

    if (isDateInPastWib(date)) {
      toast.error("Tanggal keberangkatan sudah lewat.");
      return false;
    }

    const finalPassengers =
      typeof passengers === "number"
        ? passengers
        : parseInt(String(passengers), 10) || 1;
    if (finalPassengers < 1) {
      toast.error("Jumlah penumpang minimal 1 pax.");
      return false;
    }

    if (finalPassengers > effectiveCapacity) {
      toast.error(
        `Jumlah penumpang melebihi kapasitas maksimal (${effectiveCapacity} pax) yang ditentukan.`
      );
      return false;
    }

    if (bookingBoatIsDemo) {
      toast.error(
        "Kapal ini belum terdaftar di sistem pemesanan online, jadi belum bisa dipesan. Silakan pilih kapal terdaftar dari daftar di atas."
      );
      return false;
    }

    return true;
  };

  const handleProceedToPayment = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalizeBooking = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    try {
      const formattedDate = formatDateWib(date!);
      const finalPassengers =
        typeof passengers === "number"
          ? passengers
          : parseInt(String(passengers), 10) || 1;
      const finalNotes = !pkg
        ? `Tujuan: ${destination}${notes.trim() ? ` · Catatan: ${notes.trim()}` : ""}`
        : notes.trim() || null;

      const { data: bookingResult, error } = await supabase.rpc("create_booking", {
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

      const bookingId =
        (bookingResult as { id?: string })?.id ||
        `BK-${Date.now().toString(36).toUpperCase()}`;
      setCreatedBookingId(bookingId);
      toast.success("Booking berhasil dibuat!");

      // Jika memilih Midtrans (QRIS, VA Bank, Kartu Kredit)
      if (paymentMethod !== "dock_cash") {
        try {
          const snapRes = await requestSnapToken({
            orderId: `SUAR-${bookingId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            grossAmount: payableAmount,
            customerDetails: {
              first_name: "Wisatawan",
            },
            itemDetails: [
              {
                id: bookingBoatId,
                name: pkg?.name || boat?.name || "Tiket Kapal Wisata",
                price: payableAmount,
                quantity: 1,
              },
            ],
          });

          if (snapRes?.token) {
            openSnapPayment(snapRes.token, {
              onSuccess: () => {
                toast.success("Pembayaran Midtrans berhasil!");
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
              onPending: () => {
                toast.info("Menunggu penyelesaian pembayaran...");
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
              onError: () => {
                toast.error("Pembayaran Midtrans gagal atau dibatalkan.");
              },
              onClose: () => {
                // User menutup popup Snap -> tetap tampilkan tiket pending
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
            });
            if (!window.snap?.pay) {
              setCurrentStep(3);
            }
            return;
          }
        } catch (snapErr) {
          console.warn("Snap checkout initiation error:", snapErr);
        }
      }

      // Jika Tunai di Dermaga atau fallback
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(mapBookingError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-16">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 max-w-6xl">
        {/* Tombol Navigasi Kembali */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="-ml-2 text-slate-600 hover:text-slate-900"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => prev - 1);
              } else {
                goToFleet();
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {currentStep > 1 ? "Kembali ke Langkah Sebelumnya" : "Kembali ke Armada Kapal"}
          </Button>

          <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
            Sistem Booking Maritim Terpadu Cilacap
          </span>
        </div>

        {/* 1. Checkout Progress Bar */}
        <div className="mb-8">
          <CheckoutProgressBar
            currentStep={currentStep}
            steps={CHECKOUT_STEPS}
            onStepClick={(step) => {
              if (step < currentStep) {
                setCurrentStep(step);
              }
            }}
          />
        </div>

        {/* ================= STEP 1: DETAIL TRIP ================= */}
        {currentStep === 1 && (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-slate-900">
                {pkg ? "Booking Paket Wisata" : "Booking Armada Kapal"}
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                Tentukan tanggal, jam keberangkatan, serta rute penyeberangan Anda.
              </p>

              {/* Kalender Keberangkatan */}
              <Card className="mb-6 shadow-sm border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-slate-800">
                    <CalendarIcon className="h-5 w-5 text-teal-600" />
                    Pilih Tanggal Keberangkatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => isDateInPastWib(d)}
                    className="rounded-lg border mx-auto"
                  />
                  {date && (
                    <div className="mt-3 text-xs text-teal-800 bg-teal-50 px-3 py-2 rounded-lg border border-teal-200/80 flex items-center justify-between">
                      <span>Tanggal dipilih:</span>
                      <strong className="font-bold">
                        {date.toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Formulir Detail Penumpang & Catatan */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg text-slate-800">
                    Detail Penumpang & Catatan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!pkg && (
                    <div>
                      <Label htmlFor="destination" className="text-slate-700 font-semibold">
                        Tujuan Penyeberangan
                      </Label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Compass className="h-4 w-4 text-slate-400" />
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
                      <p className="text-xs text-slate-500 mt-1">
                        Pilih tujuan wisata bahari di pesisir Cilacap & Nusakambangan.
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="passengers" className="text-slate-700 font-semibold">
                        Jumlah Penumpang
                      </Label>
                      <span className="text-xs text-teal-700 font-medium">
                        Maks. {effectiveCapacity} pax
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Users className="h-4 w-4 text-slate-400" />
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
                    <p className="text-xs text-slate-500 mt-1">
                      Setiap penumpang wajib menggunakan jaket keselamatan SOLAS yang disiapkan nakhoda.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="time" className="text-slate-700 font-semibold">
                      Waktu Keberangkatan
                    </Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <Input
                        id="time"
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Jam operasional dermaga: 07.00 – 15.00 WIB (sesuai SOP Keselamatan KSOP).
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-slate-700 font-semibold">
                      Catatan (Opsional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Tambahkan catatan untuk nakhoda (mis. rombongan anak-anak, manula, dsb)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kolom Kanan: Ringkasan Pesanan */}
            <div>
              <Card className="sticky top-24 border-slate-200 shadow-md">
                <CardHeader className="bg-slate-50/80 border-b pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                    <span>Ringkasan Pesanan</span>
                    <Badge variant="outline" className="text-xs bg-white text-teal-700 border-teal-300">
                      Langkah 1 dari 3
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {!loaded && (
                    <p className="text-sm text-muted-foreground">Memuat detail armada…</p>
                  )}

                  {loaded && !boat && !pkg && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Kapal atau paket yang dipilih tidak ditemukan.
                      </p>
                      <Button variant="outline" className="w-full" onClick={goToFleet}>
                        Lihat Armada Kapal
                      </Button>
                    </div>
                  )}

                  {boat && (
                    <>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{boat.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{boat.description}</p>
                      </div>

                      <div className="space-y-2 py-3 border-y text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Harga per pax</span>
                          <span className="font-medium">Rp {boat.base_price.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Jumlah penumpang</span>
                          <span className="font-medium">{passengers || 1} pax</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-slate-500 shrink-0">Tujuan</span>
                          <span className="font-medium text-slate-800 text-right leading-snug break-words">
                            {destination}
                          </span>
                        </div>
                        {date && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tanggal</span>
                            <span className="font-medium">{date.toLocaleDateString("id-ID")}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Waktu</span>
                          <span className="font-medium">{departureTime} WIB</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xl font-black text-slate-900">
                        <span>Total Biaya</span>
                        <span className="text-teal-700">Rp {totalPrice.toLocaleString("id-ID")}</span>
                      </div>

                      <div className="bg-teal-50/80 p-3.5 rounded-xl border border-teal-100 flex items-start gap-2.5">
                        <DollarSign className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700">
                          <p className="font-bold text-teal-900 mb-0.5">Opsi Pembayaran Fleksibel</p>
                          <p className="text-slate-600">
                            Bisa bayar DP 30% (Rp {dpAmount.toLocaleString("id-ID")}) atau Lunas via QRIS/VA Midtrans di langkah berikutnya.
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="hero"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11"
                        size="lg"
                        onClick={handleProceedToPayment}
                        disabled={loading || !date}
                      >
                        Lanjut ke Pembayaran
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                      {!date && (
                        <p className="text-[11px] text-center text-amber-700 bg-amber-50 py-1.5 px-2 rounded border border-amber-200 mt-2">
                          Silakan klik tanggal di kalender terlebih dahulu untuk melanjutkan.
                        </p>
                      )}
                    </>
                  )}

                  {pkg && (
                    <>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{pkg.name}</h3>
                        {pkg.destination && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tujuan: {pkg.destination} · Durasi: {pkg.durationLabel}
                          </p>
                        )}
                        {pkg.includes.length > 0 && (
                          <ul className="text-xs text-slate-600 mt-2 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {pkg.includes.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="space-y-2 py-3 border-y text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Harga paket</span>
                          <span className="font-medium">
                            Rp {pkg.price.toLocaleString("id-ID")} {pkg.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Jumlah penumpang</span>
                          <span className="font-medium">{passengers || 1} pax</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Armada Kapal</span>
                          <span className="font-medium text-slate-800">
                            {selectedBoat ? `${selectedBoat.name} (Operator)` : "Disiapkan Operator"}
                          </span>
                        </div>
                        {date && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tanggal</span>
                            <span className="font-medium">{date.toLocaleDateString("id-ID")}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Waktu</span>
                          <span className="font-medium">{departureTime} WIB</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xl font-black text-slate-900">
                        <span>Total Biaya</span>
                        <span className="text-teal-700">Rp {totalPrice.toLocaleString("id-ID")}</span>
                      </div>

                      <div className="bg-teal-50/80 p-3.5 rounded-xl border border-teal-100 flex items-start gap-2.5">
                        <DollarSign className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700">
                          <p className="font-bold text-teal-900 mb-0.5">Opsi Pembayaran Fleksibel</p>
                          <p className="text-slate-600">
                            Pilih skema DP 30% atau Lunas di halaman pembayaran Midtrans.
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="hero"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11"
                        size="lg"
                        onClick={handleProceedToPayment}
                        disabled={loading || !date}
                      >
                        Lanjut ke Pembayaran
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                      {!date && (
                        <p className="text-[11px] text-center text-amber-700 bg-amber-50 py-1.5 px-2 rounded border border-amber-200 mt-2">
                          Silakan klik tanggal di kalender terlebih dahulu untuk melanjutkan.
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ================= STEP 2: METODE PEMBAYARAN ================= */}
        {currentStep === 2 && (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7 space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-lg font-bold flex items-center justify-between text-slate-900">
                    <span>Pilih Metode & Skema Pembayaran</span>
                    <Badge className="bg-teal-600 text-white text-xs">
                      Midtrans Payment Gateway
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <PaymentMethodSelection
                    totalPrice={totalPrice}
                    scheme={paymentScheme}
                    onSchemeChange={setPaymentScheme}
                    selectedMethod={paymentMethod}
                    onSelectMethod={setPaymentMethod}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Kolom Kanan: Rincian Tagihan & Tombol Bayar */}
            <div className="md:col-span-5 space-y-4">
              <Card className="sticky top-24 border-slate-200 shadow-md">
                <CardHeader className="bg-slate-50/80 border-b pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                    <span>Ringkasan Tagihan</span>
                    <Badge variant="outline" className="text-xs bg-white text-teal-700 border-teal-300">
                      Langkah 2 dari 3
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900 text-sm">
                      {pkg?.name || boat?.name || "Trip Penyeberangan Wisata"}
                    </div>
                    <div className="text-slate-500">
                      Jadwal: {date?.toLocaleDateString("id-ID")} · {departureTime} WIB
                    </div>
                    <div className="text-slate-500">
                      Penumpang: {passengers} Pax · Tujuan: {pkg?.destination || destination}
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Biaya Trip</span>
                      <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Skema Pembayaran</span>
                      <span className="font-semibold text-slate-900">
                        {paymentScheme === "dp_30" ? "DP 30%" : "Lunas 100%"}
                      </span>
                    </div>
                    {paymentScheme === "dp_30" && (
                      <div className="flex justify-between text-slate-500 text-xs">
                        <span>Pelunasan di Dermaga</span>
                        <span>Rp {(totalPrice - dpAmount).toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Metode</span>
                      <span className="font-medium text-teal-700">
                        {paymentMethod === "dock_cash" ? "Tunai di Dermaga" : "Online via Midtrans"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xl font-black text-slate-900">
                    <span>Tagihan Sekarang</span>
                    <span className="text-teal-700">Rp {payableAmount.toLocaleString("id-ID")}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      data-testid="pay-now-button"
                      variant="hero"
                      size="lg"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 shadow-lg shadow-teal-600/20 text-base"
                      onClick={handleFinalizeBooking}
                      disabled={loading}
                    >
                      {loading ? (
                        "Memproses Pembayaran..."
                      ) : paymentMethod === "dock_cash" ? (
                        "Konfirmasi & Cetak E-Tiket"
                      ) : (
                        `Bayar Sekarang (Rp ${payableAmount.toLocaleString("id-ID")})`
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full text-slate-600"
                      onClick={() => setCurrentStep(1)}
                      disabled={loading}
                    >
                      Ubah Detail Trip
                    </Button>
                  </div>

                  <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Garansi Pembatalan Aman sesuai Ketentuan KSOP</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ================= STEP 3: E-TIKET DIGITAL ================= */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Banner Sukses */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 flex items-center gap-3.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                  Pemesanan & Pembayaran Berhasil!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-800">
                  E-Tiket resmi telah terbit. Tunjukkan boarding pass ini kepada nakhoda kapal di Dermaga Pandanarang.
                </p>
              </div>
            </div>

            {/* Kartu Boarding Pass Digital */}
            <Card className="border border-slate-200 overflow-hidden shadow-xl rounded-3xl bg-white print:border-none print:shadow-none">
              {/* Header Boarding Pass */}
              <div className="bg-[#090D16] text-white p-6 relative overflow-hidden print:bg-white print:text-slate-900 print:border-b-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                    Boarding Pass Resmi Penyeberangan Wisata
                  </span>
                  <Badge className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs px-2.5 py-0.5">
                    SUAR CILACAP
                  </Badge>
                </div>
                <div className="flex items-center gap-2.5">
                  <Ship className="w-6 h-6 text-teal-400 shrink-0" />
                  <h3 className="text-xl font-black text-white">
                    {pkg?.name || boat?.name || "Kapal Wisata Pesisir"}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Kode Booking</span>
                    <span className="font-mono text-base font-extrabold text-teal-300">
                      SUAR-{createdBookingId ? createdBookingId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase() : "BK9921X"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Status Pembayaran</span>
                    <Badge className="bg-emerald-500 text-white text-[11px] font-bold">
                      {paymentMethod === "dock_cash"
                        ? "Menunggu Bayar di Dermaga"
                        : paymentScheme === "dp_30"
                          ? "DP 30% Terbayar (Midtrans)"
                          : "Lunas (Midtrans)"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rincian Tiket */}
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Tanggal Berlayar</span>
                    <strong className="text-slate-900 font-bold">
                      {date ? date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Jam Keberangkatan</span>
                    <strong className="text-slate-900 font-bold">{departureTime} WIB</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Jumlah Penumpang</span>
                    <strong className="text-slate-900 font-bold">{passengers} Pax</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Dermaga Keberangkatan</span>
                    <strong className="text-slate-900 font-bold">Pandanarang, Teluk Penyu</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Tujuan Trip</span>
                    <span className="font-bold text-slate-800">{pkg?.destination || destination}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Pembayaran</span>
                    <span className="font-bold text-slate-800">Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  {paymentScheme === "dp_30" && (
                    <div className="flex justify-between text-amber-700 font-medium">
                      <span>Sisa Pelunasan di Dermaga</span>
                      <span>Rp {(totalPrice - dpAmount).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                {/* QR Code & Sertifikasi */}
                <div className="p-4 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-xs block">
                      Verifikasi Tiket Nakhoda & Dermaga
                    </span>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Dilengkapi proteksi asuransi keselamatan Jasa Raharja & manifes KSOP Cilacap.
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shadow-sm shrink-0">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-300 text-slate-700"
                    onClick={handlePrint}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak / Simpan PDF
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold"
                    onClick={() => navigate("/dashboard")}
                  >
                    Buka di Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Booking;
