"use client";

import React from "react";

// ---------------------------------------------------------------------------
// KPI / contador
// ---------------------------------------------------------------------------
export function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = "#041e3a",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="rounded-lg p-2" style={{ background: `${accent}14`, color: accent }}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-[#041e3a]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Donut (rosca) — distribuição por categoria
// ---------------------------------------------------------------------------
export function DonutChart({
  data,
  size = 168,
  thickness = 24,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}) {
  const itens = data.filter((d) => d.value > 0);
  const total = itens.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {total > 0 &&
            itens.map((d, i) => {
              const len = (d.value / total) * c;
              const seg = (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return seg;
            })}
        </g>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="fill-[#041e3a]" fontSize="26" fontWeight="700">
          {total}
        </text>
        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="central" className="fill-gray-400" fontSize="11">
          total
        </text>
      </svg>

      <ul className="space-y-2 w-full">
        {itens.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="font-semibold text-[#041e3a] ml-auto">{d.value}</span>
          </li>
        ))}
        {total === 0 && <li className="text-sm text-gray-400">Sem dados.</li>}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Barras horizontais
// ---------------------------------------------------------------------------
export function BarChart({
  data,
  color = "#041e3a",
  formatValue,
}: {
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sem dados.</p>;
  }
  return (
    <div className="space-y-3.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between items-baseline text-xs mb-1 gap-2">
            <span className="text-gray-600 font-medium truncate">{d.label}</span>
            <span className="text-[#041e3a] font-semibold shrink-0">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max((d.value / max) * 100, 2)}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
