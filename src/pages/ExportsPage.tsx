import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Button,
  DataTable,
  ErrorState,
  FormDialog,
  PageHeader,
} from "@zatgo/ui";
import { FileDown } from "@zatgo/icons";
import { toast } from "sonner";
import { mockRepo, type ExportJob } from "@/lib/mock-data";

export function ExportsPage() {
  const [open, setOpen] = useState(false);
  const [reportName, setReportName] = useState("Branch sales by item");
  const [format, setFormat] = useState<ExportJob["format"]>("xlsx");
  const qc = useQueryClient();

  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["report-studio", "exports"],
    queryFn: () => mockRepo.listExports(),
  });

  const enqueue = useMutation({
    mutationFn: () => mockRepo.enqueueExport({ reportName: reportName.trim(), format }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["report-studio", "exports"] });
      void qc.invalidateQueries({ queryKey: ["report-studio", "counts"] });
      toast.success("Export queued (mock)");
      setOpen(false);
    },
  });

  const columns = useMemo<ColumnDef<ExportJob, unknown>[]>(
    () => [
      { accessorKey: "reportName", header: "Report" },
      {
        accessorKey: "format",
        header: "Format",
        cell: ({ getValue }) => String(getValue()).toUpperCase(),
      },
      { accessorKey: "status", header: "Status" },
      {
        accessorKey: "bytes",
        header: "Size",
        cell: ({ getValue }) => {
          const n = getValue() as number | undefined;
          return n != null ? `${(n / 1024).toFixed(1)} KB` : "—";
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => new Date(String(getValue())).toLocaleString(),
      },
    ],
    [],
  );

  if (isError) {
    return (
      <ErrorState
        title="Could not load exports"
        description={error instanceof Error ? error.message : String(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Exports"
        description="Queue CSV / XLSX / PDF jobs against saved reports (local mock queue)."
        actions={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <FileDown className="size-4" />
            Queue export
          </Button>
        }
      />
      <DataTable
        data={data}
        columns={columns}
        emptyMessage="No export jobs"
        loading={isLoading}
      />

      <FormDialog
        open={open}
        title="Queue export"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => enqueue.mutate()} disabled={enqueue.isPending}>
              Queue
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Report name</span>
            <input
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 outline-none focus:border-[var(--color-primary)]"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Format</span>
            <select
              className="h-9 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 outline-none focus:border-[var(--color-primary)]"
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportJob["format"])}
            >
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
        </div>
      </FormDialog>
    </div>
  );
}
