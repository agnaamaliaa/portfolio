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
  const response = await fetch(DATA_SOURCE_URL, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch marketing metrics');
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== 'object') {
    throw new Error('Unexpected API response format');
  }

  return mapResponseToMetrics(data as Record<string, unknown>);
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{value}</p>
    </article>
  );
}

export default async function HomePage() {
  const metrics = await getMetrics();

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 lg:px-12">
      <section className="mx-auto w-full max-w-7xl space-y-8">
        <header className="space-y-2">
          <span className="inline-flex items-center rounded-full border border-brand-500/20 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
            Marketing Overview
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Campaign Performance Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
            Live KPI snapshot fetched from your API endpoint. Clean SaaS-style view for quick reporting.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Impressions" value={numberFormatter.format(metrics.impressions)} />
          <KpiCard label="Clicks" value={numberFormatter.format(metrics.clicks)} />
          <KpiCard label="CTR" value={percentFormatter.format(metrics.ctr)} />
          <KpiCard label="CPC" value={currencyFormatter.format(metrics.cpc)} />
          <KpiCard label="Conversions" value={numberFormatter.format(metrics.conversions)} />
          <KpiCard
            label="Cost per Conversion"
            value={currencyFormatter.format(metrics.costPerConversion)}
          />
        </section>
      </section>
    </main>
  );
}
