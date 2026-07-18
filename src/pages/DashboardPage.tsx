import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { mockRepo } from "@/lib/mock-data";

const cards = [
  { key: "datasets" as const, label: "Datasets", to: "/datasets" },
  { key: "reports" as const, label: "Saved reports", to: "/reports" },
  { key: "charts" as const, label: "Charts", to: "/charts" },
  { key: "dashboards" as const, label: "Dashboards", to: "/dashboards" },
  { key: "exportsQueued" as const, label: "Exports in flight", to: "/exports" },
  { key: "rowsIndexed" as const, label: "Rows indexed", to: "/datasets" },
];

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["report-studio", "counts"],
    queryFn: () => mockRepo.counts(),
  });

  return (
    <div>
      <PageHeader
        title="Report studio"
        description="Cross-app read models for pivots, charts, dashboards, and exports. Counts come from the local mock repository."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 transition-colors hover:bg-[var(--color-muted)]"
          >
            <p className="text-sm text-[var(--color-muted-foreground)]">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {data?.[card.key] != null ? data[card.key].toLocaleString() : "—"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
