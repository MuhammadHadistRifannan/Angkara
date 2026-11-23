import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type StepItem,
  DEFAULT_CHECKOUT_STEPS,
} from "./checkoutTypes";

export interface CheckoutProgressBarProps {
  currentStep: number;
  steps?: StepItem[];
  onStepClick?: (step: number) => void;
  className?: string;
}

export const CheckoutProgressBar: React.FC<CheckoutProgressBarProps> = ({
  currentStep,
  steps = DEFAULT_CHECKOUT_STEPS,
  onStepClick,
  className,
}) => {
  return (
    <nav
      aria-label="Proses Checkout"
      className={cn("w-full py-4 px-2 sm:px-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm", className)}
    >
      <ol className="flex items-center justify-between w-full relative">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isUpcoming = step.id > currentStep;
          const isClickable = isCompleted && !!onStepClick;

          // Hitung apakah garis penghubung sebelum langkah ini sudah terlewati
          const isLineActive = step.id <= currentStep;

          return (
            <li
              key={step.id}
              className="flex-1 flex flex-col items-center relative group"
            >
              {/* Garis penghubung ke langkah sebelumnya */}
              {index > 0 && (
                <div
                  className={cn(
                    "absolute top-5 sm:top-6 -left-1/2 w-full h-[3px] -translate-y-1/2 transition-colors duration-300",
                    isLineActive ? "bg-teal-500" : "bg-slate-200"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Tombol / Lingkaran Status Stepper */}
              <button
                type="button"
                data-testid={`step-button-${step.id}`}
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.id);
                  }
                }}
                disabled={!isClickable}
                className={cn(
                  "relative z-10 flex items-center justify-center transition-all duration-300 outline-none",
                  isClickable ? "cursor-pointer hover:scale-105" : "cursor-default"
                )}
                aria-label={`Langkah ${step.id}: ${step.label} (${
                  isCompleted ? "Selesai" : isActive ? "Sedang Berlangsung" : "Belum Dimulai"
                })`}
              >
                {/* Halo luar cincin abu-abu lembut seperti di gambar referensi */}
                <div
                  data-testid={`step-circle-${step.id}`}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 shadow-sm",
                    "ring-4 ring-slate-100",
                    isCompleted && "bg-teal-500 text-white ring-teal-100",
                    isActive && "bg-teal-500 text-white ring-teal-200 ring-offset-2 ring-offset-white shadow-md shadow-teal-500/20 scale-105",
                    isUpcoming && "bg-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? (
                    <Check
                      data-testid="step-completed-icon"
                      className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]"
                    />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
              </button>

              {/* Label & Keterangan Langkah */}
              <div className="mt-2.5 text-center flex flex-col items-center">
                <span
                  className={cn(
                    "text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200",
                    isActive ? "text-teal-900 font-extrabold" : isCompleted ? "text-slate-800" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden md:block text-[11px] text-slate-500 mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
