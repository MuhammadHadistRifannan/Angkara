import React from "react";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  type PaymentMethodId,
  type PaymentScheme,
  PAYMENT_METHOD_OPTIONS,
} from "./checkoutTypes";

export interface PaymentMethodSelectionProps {
  totalPrice: number;
  scheme: PaymentScheme;
  onSchemeChange: (scheme: PaymentScheme) => void;
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  className?: string;
}

export const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  totalPrice,
  scheme,
  onSchemeChange,
  selectedMethod,
  onSelectMethod,
  className,
}) => {
  const dpAmount = Math.round(totalPrice * 0.3);
  const remainingAmount = totalPrice - dpAmount;
  const payableAmount = scheme === "dp_30" ? dpAmount : totalPrice;

  return (
    <div className={cn("space-y-6", className)}>
      {/* 1. Pemilihan Skema Pembayaran (DP 30% vs Lunas 100%) */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">
          Pilih Skema Pembayaran
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Opsi DP 30% */}
          <button
            type="button"
            data-testid="scheme-option-dp_30"
            onClick={() => onSchemeChange("dp_30")}
            className={cn(
              "text-left p-4 rounded-xl border-2 transition-all relative outline-none flex flex-col justify-between",
              scheme === "dp_30"
                ? "border-teal-600 bg-teal-50/60 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Bayar DP 30%</span>
                <span className="text-xs text-slate-500">Konfirmasi booking awal</span>
              </div>
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  scheme === "dp_30"
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-300 bg-white"
                )}
              >
                {scheme === "dp_30" && <CheckCircle2 className="w-4 h-4 fill-current" />}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80">
              <span className="text-lg font-black text-teal-700">
                Rp {dpAmount.toLocaleString("id-ID")}
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Sisa Rp {remainingAmount.toLocaleString("id-ID")} dibayar di dermaga
              </span>
            </div>
          </button>

          {/* Opsi Lunas 100% */}
          <button
            type="button"
            data-testid="scheme-option-full_100"
            onClick={() => onSchemeChange("full_100")}
            className={cn(
              "text-left p-4 rounded-xl border-2 transition-all relative outline-none flex flex-col justify-between",
              scheme === "full_100"
                ? "border-teal-600 bg-teal-50/60 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Bayar Lunas 100%</span>
                <span className="text-xs text-slate-500">Tiket langsung terbit penuh</span>
              </div>
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  scheme === "full_100"
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-300 bg-white"
                )}
              >
                {scheme === "full_100" && <CheckCircle2 className="w-4 h-4 fill-current" />}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80">
              <span className="text-lg font-black text-teal-700">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
              <span className="block text-[11px] text-emerald-600 font-medium mt-0.5">
                Bebas repot saat hari pelayaran
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Pemilihan Metode Pembayaran */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-800">
            Pilih Metode Pembayaran
          </label>
          <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            Midtrans Terverifikasi
          </span>
        </div>

        <div className="space-y-2.5">
          {PAYMENT_METHOD_OPTIONS.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;

            return (
              <button
                key={method.id}
                type="button"
                data-testid={`payment-method-${method.id}`}
                onClick={() => onSelectMethod(method.id)}
                className={cn(
                  "w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all outline-none flex items-start gap-3.5",
                  isSelected
                    ? "border-teal-600 bg-teal-50/40 shadow-sm ring-1 ring-teal-500/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-lg shrink-0 transition-colors",
                    isSelected
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {method.name}
                    </span>
                    {method.badge && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-2 py-0.5",
                          isSelected
                            ? "bg-teal-100 text-teal-800 border-teal-200"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {method.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {method.description}
                  </p>

                  {method.subBadges && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {method.subBadges.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 fill-current" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Ringkasan Tagihan & Keamanan */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Total Biaya Perjalanan</span>
          <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Asuransi Jasa Raharja & KSOP</span>
          <span className="text-emerald-600 font-medium">Termasuk</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Biaya Layanan Gerbang Pembayaran</span>
          <span className="text-emerald-600 font-medium">Rp 0 (Gratis)</span>
        </div>
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
          <span className="text-slate-900">
            {scheme === "dp_30" ? "Tagihan DP Saat Ini (30%)" : "Total Tagihan Saat Ini"}
          </span>
          <span className="text-lg text-teal-700 font-black">
            Rp {payableAmount.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* 4. Keamanan Midtrans Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-1">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <span>
          Transaksi diproses melalui <strong>Midtrans</strong> terenkripsi <strong>256-bit SSL</strong>
        </span>
      </div>
    </div>
  );
};
