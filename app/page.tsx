"use client";
import React from "react";

const DATA_SOURCE_URL =
  'https://script.google.com/macros/s/AKfycbzERu2c_R_r2JbjFt7CDEtS7qcDYLtaJ7-ETNrPBo9EXEh60VcJDCfHpaS8fCuy3H0OZA/exec';

type Metrics = {
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  costPerConversion: number;
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat('en-US');
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2
});

function normalizeNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function mapResponseToMetrics(payload: Record<string, unknown>): Metrics {
  const impressions = normalizeNumber(payload.impressions);
  const clicks = normalizeNumber(payload.clicks);
  const ctrRaw = normalizeNumber(payload.ctr);
  const ctr = ctrRaw > 1 ? ctrRaw / 100 : ctrRaw;
  const cpc = normalizeNumber(payload.cpc);
  const conversions = normalizeNumber(payload.conversions);

  const costPerConversionFromApi = normalizeNumber(
    payload.costPerConversion ?? payload.cost_per_conversion
  );

  const costPerConversion =
    costPerConversionFromApi || (conversions > 0 ? (cpc * clicks) / conversions : 0);

  return {
    impressions,
    clicks,
    ctr,
    cpc,
    conversions,
    costPerConversion
  };
}

async function getMetrics(): Promise<Metrics> {
  try {
    const response = await fetch(DATA_SOURCE_URL, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data: any = await response.json();

    return {
      impressions: data.impressions ?? 0,
      clicks: data.clicks ?? 0,
      ctr: data.ctr ?? 0,
      cpc: data.cpc ?? 0,
      conversions: data.conversions ?? 0,
      costPerConversion: data.cost_per_conversion ?? 0,
    };

  } catch (error) {
    console.error('API ERROR:', error);

    return {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      conversions: 0,
      costPerConversion: 0,
    };
  }
}
function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{value}</p>
    </article>
  );
}

"use client";
import React from "react";

export default function HomePage() {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const [metrics, setMetrics] = React.useState({
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    conversions: 0,
    costPerConversion: 0,
  });

  React.useEffect(() => {
    fetch(DATA_SOURCE_URL)
      .then((res) => res.json())
      .then((data) => {
        setMetrics({
          impressions: data.impressions ?? 0,
          clicks: data.clicks ?? 0,
          ctr: data.ctr ?? 0,
          cpc: data.cpc ?? 0,
          conversions: data.conversions ?? 0,
          costPerConversion: data.cost_per_conversion ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 lg:px-12">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">MARKETING OVERVIEW</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Campaign Performance Dashboard
          </h1>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">WEBARQ</p>
          <p className="text-xl font-bold tracking-wide">PROMOTE</p>

         <div className="flex gap-2 mt-2">
  <a
    href={`https://wa.me/?text=Check dashboard: ${encodeURIComponent(window.location.href)}`}
    target="_blank"
    className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg"
  >
    WA
  </a>

  <a
    href={`mailto:?subject=Campaign Report&body=Check this dashboard: ${window.location.href}`}
    className="text-xs bg-slate-800 text-white px-3 py-1 rounded-lg"
  >
    Email
  </a>
        </div>
      </div>

      {/* DATE RANGE */}
      <div className="flex items-center gap-3 mb-8">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <span>-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Impressions" value={numberFormatter.format(metrics.impressions)} />
        <KpiCard label="Clicks" value={numberFormatter.format(metrics.clicks)} />
        <KpiCard label="CTR" value={percentFormatter.format(metrics.ctr)} />
        <KpiCard label="CPC" value={currencyFormatter.format(metrics.cpc)} />
        <KpiCard label="Conversions" value={numberFormatter.format(metrics.conversions)} />
        <KpiCard label="Cost per Conversion" value={currencyFormatter.format(metrics.costPerConversion)} />
      </section>

    </main>
  );
}
