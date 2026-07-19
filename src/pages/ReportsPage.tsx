import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Button,
  DataTable,
  ErrorState,
  FormDialog,
  PageHeader,
  SearchField,
} from "@zatgo/ui";
import { Plus } from "@zatgo/icons";
import { toast } from "sonner";
import { mockRepo, type SavedReport } from "@/lib/mock-data";

export function ReportsPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [datasetId, setDatasetId] = useState("ds-sales");
  const [kind, setKind] = useState<SavedReport["kind"]>("table");
  const qc = useQueryClient();

  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["report-studio", "reports", query],
    queryFn: () => mockRepo.listReports(query),
  });

  const { data: datasets = [] } = useQuery({
    queryKey: ["report-studio", "datasets", ""],
    queryFn: () => mockRepo.listDatasets(""),
  });

  const create = useMutation({
    mutationFn: () =>
      mockRepo.createReport({
        name: name.trim() || "Untitled report",
        datasetId,
        kind,
        owner: "you",
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["report-studio", "reports"] });
      void qc.invalidateQueries({ queryKey: ["report-studio", "counts"] });
      toast.success("Report saved (mock)");
      setOpen(false);
      setName("");
    },
  });

  const columns = useMemo<ColumnDef<SavedReport, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Report" },
      {
        accessorKey: "datasetId",
        header: "Dataset",
        cell: ({ getValue }) => mockRepo.datasetName(String(getValue())),
      },
      { accessorKey: "kind", header: "Kind" },
      { accessorKey: "owner", header: "Owner" },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ getValue }) => new Date(String(getValue())).toLocaleString(),
      },
    ],
    [],
  );

  if (isError) {
    return (
      <ErrorState
        title="Could not load reports"
        description={error instanceof Error ? error.message : String(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Saved table, pivot, and chart definitions over cross-app datasets."
        actions={
          <>
            <SearchField value={query} onChange={setQuery} placeholder="Filter reports…" />
            <Button className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              New report
            </Button>
          </>
        }
      />
      <DataTable
        data={data}
        columns={columns}
        emptyMessage="No reports yet"
        loading={isLoading}
      />

      <FormDialog
        open={open}
        title="New report"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Name</span>
            <input
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 outline-none focus:border-[var(--color-primary)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Monthly branch mix"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Dataset</span>
            <select
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 outline-none focus:border-[var(--color-primary)]"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Kind</span>
            <select
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 outline-none focus:border-[var(--color-primary)]"
              value={kind}
              onChange={(e) => setKind(e.target.value as SavedReport["kind"])}
            >
              <option value="table">Table</option>
              <option value="pivot">Pivot</option>
              <option value="chart">Chart</option>
            </select>
          </label>
        </div>
      </FormDialog>
    </div>
  );
}
