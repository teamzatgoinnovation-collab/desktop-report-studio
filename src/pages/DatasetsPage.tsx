import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, ErrorState, PageHeader, SearchField } from "@zatgo/ui";
import { mockRepo, type Dataset } from "@/lib/mock-data";

export function DatasetsPage() {
  const [query, setQuery] = useState("");
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["report-studio", "datasets", query],
    queryFn: () => mockRepo.listDatasets(query),
  });

  const columns = useMemo<ColumnDef<Dataset, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Dataset" },
      { accessorKey: "app", header: "App" },
      {
        accessorKey: "reportMethod",
        header: "Read method",
        cell: ({ getValue }) => (
          <code className="text-xs text-[var(--color-muted-foreground)]">
            {String(getValue())}
          </code>
        ),
      },
      {
        accessorKey: "rowCount",
        header: "Rows",
        cell: ({ getValue }) => Number(getValue()).toLocaleString(),
      },
      {
        accessorKey: "fields",
        header: "Fields",
        cell: ({ row }) => row.original.fields.join(", "),
      },
    ],
    [],
  );

  if (isError) {
    return (
      <ErrorState
        title="Could not load datasets"
        description={error instanceof Error ? error.message : String(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Datasets"
        description="Read-only reporting views exposed by each backend app (api.v1.reports.*)."
        actions={<SearchField value={query} onChange={setQuery} placeholder="Filter datasets…" />}
      />
      <DataTable
        data={data}
        columns={columns}
        emptyMessage="No datasets match"
        loading={isLoading}
      />
    </div>
  );
}
