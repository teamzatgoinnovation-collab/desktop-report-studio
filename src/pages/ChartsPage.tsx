import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@zatgo/ui";
import { mockRepo, type ChartSpec } from "@/lib/mock-data";

function maxValue(series: ChartSpec["series"]) {
  return Math.max(...series.map((s) => s.value), 1);
}

function BarChart({ chart }: { chart: ChartSpec }) {
  const max = maxValue(chart.series);
  return (
    <div className="flex h-40 items-end gap-2">
      {chart.series.map((s) => (
        <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full max-w-12 rounded-t-[var(--radius-lg)] bg-[var(--rs-chart-a)]"
            style={{ height: `${(s.value / max) * 100}%` }}
            title={String(s.value)}
          />
          <span className="truncate text-xs text-[var(--color-muted-foreground)]">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ chart }: { chart: ChartSpec }) {
  const max = maxValue(chart.series);
  const points = chart.series
    .map((s, i) => {
      const x = (i / Math.max(chart.series.length - 1, 1)) * 100;
      const y = 100 - (s.value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-40 w-full" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="var(--rs-chart-b)"
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function PieChartView({ chart }: { chart: ChartSpec }) {
  const total = chart.series.reduce((sum, s) => sum + s.value, 0) || 1;
  const colors = ["var(--rs-chart-a)", "var(--rs-chart-b)", "var(--rs-chart-c)", "oklch(0.7 0.1 320)"];
  let angle = 0;
  const slices = chart.series.map((s, i) => {
    const start = angle;
    const sweep = (s.value / total) * 360;
    angle += sweep;
    const r = 40;
    const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const x1 = 50 + r * Math.cos(rad(start));
    const y1 = 50 + r * Math.sin(rad(start));
    const x2 = 50 + r * Math.cos(rad(start + sweep));
    const y2 = 50 + r * Math.sin(rad(start + sweep));
    const large = sweep > 180 ? 1 : 0;
    return (
      <path
        key={s.label}
        d={`M50,50 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
        fill={colors[i % colors.length]}
      />
    );
  });
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-40 shrink-0">
        {slices}
      </svg>
      <ul className="space-y-1 text-sm">
        {chart.series.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: colors[i % colors.length] }}
            />
            {s.label}{" "}
            <span className="text-[var(--color-muted-foreground)]">{s.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartsPage() {
  const { data = [] } = useQuery({
    queryKey: ["report-studio", "charts"],
    queryFn: () => mockRepo.listCharts(),
  });

  return (
    <div>
      <PageHeader
        title="Charts"
        description="Lightweight SVG previews over mock series. Wire to real report series later."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((chart) => (
          <section
            key={chart.id}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4"
          >
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="font-semibold">{chart.name}</h2>
              <span className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                {chart.type} · {mockRepo.datasetName(chart.datasetId)}
              </span>
            </div>
            {chart.type === "bar" ? <BarChart chart={chart} /> : null}
            {chart.type === "line" ? <LineChart chart={chart} /> : null}
            {chart.type === "pie" ? <PieChartView chart={chart} /> : null}
          </section>
        ))}
      </div>
    </div>
  );
}
