import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@zatgo/ui";
import { Plus } from "@zatgo/icons";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SearchField } from "@/components/SearchField";
import { DataTable } from "@/components/DataTable";
import { FormDialog } from "@/components/FormDialog";
import { mockRepo, type Dashboard } from "@/lib/mock-data";

export function DashboardsPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shared, setShared] = useState(true);
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["report-studio", "dashboards", query],
    queryFn: () => mockRepo.listDashboards(query),
  });

  const create = useMutation({
    mutationFn: () =>
      mockRepo.createDashboard({
        name: name.trim() || "Untitled dashboard",
        description: description.trim() || "No description",
        shared,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["report-studio", "dashboards"] });
      void qc.invalidateQueries({ queryKey: ["report-studio", "counts"] });
      toast.success("Dashboard created (mock)");
      setOpen(false);
      setName("");
      setDescription("");
    },
  });

  const columns = useMemo<ColumnDef<Dashboard, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Dashboard" },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "widgetCount", header: "Widgets" },
      {
        accessorKey: "shared",
        header: "Shared",
        cell: ({ getValue }) => (getValue() ? "Yes" : "Private"),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ getValue }) => new Date(String(getValue())).toLocaleString(),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Dashboards"
        description="Compose charts and pivots into shareable boards (mock list for now)."
        actions={
          <>
            <SearchField value={query} onChange={setQuery} placeholder="Filter dashboards…" />
            <Button className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              New dashboard
            </Button>
          </>
        }
      />
      <DataTable data={data} columns={columns} emptyMessage="No dashboards" />

      <FormDialog
        open={open}
        title="New dashboard"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              Create
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
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              className="min-h-20 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
            />
            Share with company
          </label>
        </div>
      </FormDialog>
    </div>
  );
}
