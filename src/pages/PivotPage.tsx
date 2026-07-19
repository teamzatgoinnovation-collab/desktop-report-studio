import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "@zatgo/ui";
import { mockRepo } from "@/lib/mock-data";

export function PivotPage() {
  const [datasetId, setDatasetId] = useState("ds-sales");

  const { data: datasets = [] } = useQuery({
    queryKey: ["report-studio", "datasets", ""],
    queryFn: () => mockRepo.listDatasets(""),
  });

  const { data } = useQuery({
    queryKey: ["report-studio", "pivot", datasetId],
    queryFn: () => mockRepo.getPivot(datasetId),
  });

  const valueMap = new Map(
    (data?.cells ?? []).map((c) => [`${c.row}|${c.col}`, c.value] as const),
  );

  return (
    <div>
      <PageHeader
        title="Pivot"
        description="Drag-and-drop builder is stubbed; mock cells show branch × category amounts."
        actions={
          <select
            className="h-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]"
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        }
      />

      {data ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Rows: <span className="text-[var(--color-foreground)]">{data.rowField}</span> · Columns:{" "}
            <span className="text-[var(--color-foreground)]">{data.colField}</span> · Values:{" "}
            <span className="text-[var(--color-foreground)]">{data.valueField}</span>
          </p>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[var(--rs-pivot-header)]">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium text-[var(--color-muted-foreground)]">
                    {data.rowField}
                  </th>
                  {data.cols.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2.5 text-right font-medium text-[var(--color-muted-foreground)]"
                    >
                      {col}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => {
                  const total = data.cols.reduce(
                    (sum, col) => sum + (valueMap.get(`${row}|${col}`) ?? 0),
                    0,
                  );
                  return (
                    <tr key={row} className="border-t border-[var(--color-border)]">
                      <td className="px-3 py-2.5 font-medium">{row}</td>
                      {data.cols.map((col) => (
                        <td key={col} className="px-3 py-2.5 text-right tabular-nums">
                          {(valueMap.get(`${row}|${col}`) ?? 0).toLocaleString()}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                        {total.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
