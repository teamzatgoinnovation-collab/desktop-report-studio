import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/PageHeader";
import { SearchField } from "@/components/SearchField";
import { DataTable } from "@/components/DataTable";
import { mockRepo, type Dataset } from "@/lib/mock-data";

export function DatasetsPage() {
  const [query, setQuery] = useState("");
  const { data = [] } = useQuery({
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

  return (
    <div>
      <PageHeader
        title="Datasets"
        description="Read-only reporting views exposed by each backend app (api.v1.reports.*)."
        actions={<SearchField value={query} onChange={setQuery} placeholder="Filter datasets…" />}
      />
      <DataTable data={data} columns={columns} emptyMessage="No datasets match" />
    </div>
  );
}
