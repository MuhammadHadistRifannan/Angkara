import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { HourSample } from "../../../supabase/functions/_shared/safety/rules";

interface MarineChartProps {
  samples: HourSample[];
  thresholds?: {
    maxWaveM: number;
    maxWindKn: number;
    waspadaMmH: number;
    tundaMmH: number;
  };
  pointName: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number | string | null;
  color?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-popover text-popover-foreground border p-2.5 rounded-lg shadow-lg text-xs space-y-1 z-50">
      <div className="font-semibold border-b pb-1 mb-1">{label}</div>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center justify-between gap-4">
          <span style={{ color: entry.color }} className="font-medium">
            {entry.name}:
          </span>
          <span className="font-mono">
            {entry.value !== null && entry.value !== undefined ? entry.value : "Tidak tersedia"}
          </span>
        </div>
      ))}
    </div>
  );
};

export const MarineChart: React.FC<MarineChartProps> = ({
  samples,
  thresholds = { maxWaveM: 1.25, maxWindKn: 15, waspadaMmH: 5.0, tundaMmH: 20.0 },
  pointName,
}) => {
  // Ambil 48-72 jam pertama
  const chartData = samples.slice(0, 72).map((s) => {
    // Format label jam: misal "09/11 08:00"
    const d = new Date(s.time);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const label = `${day}/${month} ${hour}:00`;

    return {
      time: s.time,
      displayTime: label,
      gelombang: s.waveM,
      angin: s.windKn,
      hujan: s.rainMmH,
      petir: s.thunder,
    };
  });

  const hasWaveData = chartData.some((d) => d.gelombang !== null && d.gelombang !== undefined);

  return (
    <div className="w-full space-y-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Prakiraan 48-72 Jam: {pointName}
        </h4>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Gelombang (m)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
            Angin (knot)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            Hujan (mm/j)
          </span>
        </div>
      </div>

      <div className="w-full h-64 bg-card rounded-lg border p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="displayTime"
              tick={{ fontSize: 10 }}
              interval={Math.max(1, Math.floor(chartData.length / 8))}
            />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} domain={[0, "auto"]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />

            {/* Garis Ambang Batas Keselamatan */}
            {hasWaveData && (
              <ReferenceLine
                yAxisId="left"
                y={thresholds.maxWaveM}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `Batas Gelombang (${thresholds.maxWaveM}m)`,
                  position: "top",
                  fontSize: 9,
                  fill: "#ef4444",
                }}
              />
            )}
            <ReferenceLine
              yAxisId="right"
              y={thresholds.maxWindKn}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: `Batas Angin (${thresholds.maxWindKn}kn)`,
                position: "insideTopRight",
                fontSize: 9,
                fill: "#f59e0b",
              }}
            />
            {thresholds.waspadaMmH !== undefined && (
              <ReferenceLine
                yAxisId="right"
                y={thresholds.waspadaMmH}
                stroke="#8b5cf6"
                strokeDasharray="3 3"
                label={{
                  value: `Hujan Waspada (${thresholds.waspadaMmH}mm/j)`,
                  position: "insideBottomRight",
                  fontSize: 8,
                  fill: "#8b5cf6",
                }}
              />
            )}
            {thresholds.tundaMmH !== undefined && (
              <ReferenceLine
                yAxisId="right"
                y={thresholds.tundaMmH}
                stroke="#dc2626"
                strokeDasharray="3 3"
                label={{
                  value: `Hujan Tunda (${thresholds.tundaMmH}mm/j)`,
                  position: "insideTopLeft",
                  fontSize: 8,
                  fill: "#dc2626",
                }}
              />
            )}

            {/* Data Hujan (Bar) */}
            <Bar
              yAxisId="right"
              dataKey="hujan"
              name="Curah Hujan (mm/j)"
              fill="#6366f1"
              opacity={0.6}
            />

            {/* Data Angin (Line) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="angin"
              name="Kecepatan Angin (kn)"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
            />

            {/* Data Gelombang (Line) */}
            {hasWaveData && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="gelombang"
                name="Tinggi Gelombang (m)"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {!hasWaveData && (
        <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
          Catatan: Data gelombang tidak tersedia untuk titik daratan/pesisir ini.
        </div>
      )}
    </div>
  );
};
