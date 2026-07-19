import { ZatGoApi } from "@zatgo/erpnext";
import { callZatGoApi } from "@/lib/call-zatgo-api";
import type {
  ChartSpec,
  Dashboard,
  Dataset,
  ExportJob,
  PivotCell,
  SavedReport,
} from "@/lib/report-models";

export type * from "@/lib/report-models";

export type PivotTable = {
  rowField: string;
  colField: string;
  valueField: string;
  rows: string[];
  cols: string[];
  cells: PivotCell[];
};

const NOT_READY = "ERPNext report mutations are not available yet.";

function asRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  return [];
}

function matchesQuery(text: string, query?: string) {
  if (!query?.trim()) return true;
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

/** Live ERPNext-backed report studio via zatgo_core.bi (UI still uses optional query filters). */
export const mockRepo = {
  datasetName(id: string) {
    return id;
  },

  async counts() {
    await callZatGoApi(ZatGoApi.bi.ping);
    const datasets = await this.listDatasets();
    return {
      datasets: datasets.length,
      reports: 0,
      charts: 0,
      dashboards: 0,
      exports: 0,
      exportsQueued: 0,
      rowsIndexed: datasets.reduce((sum, d) => sum + d.rowCount, 0),
    };
  },

  async listDatasets(query?: string): Promise<Dataset[]> {
    const env = await callZatGoApi<unknown[]>(ZatGoApi.bi.reportsList, {
      page: 1,
      page_size: 100,
    });
    return asRows(env.data)
      .map((row) => ({
        id: String(row.id ?? row.name ?? ""),
        name: String(row.name ?? row.title ?? "Report"),
        app: (row.app as Dataset["app"]) || "resto_pos",
        reportMethod: String(row.reportMethod ?? ZatGoApi.bi.reportsList),
        fields: Array.isArray(row.fields) ? (row.fields as string[]) : [],
        rowCount: Number(row.rowCount ?? 0),
        refreshedAt: String(row.refreshedAt ?? new Date().toISOString()),
      }))
      .filter((d) => d.id && matchesQuery(`${d.name} ${d.app}`, query));
  },

  async listReports(query?: string): Promise<SavedReport[]> {
    void query;
    return [];
  },

  async listCharts(query?: string): Promise<ChartSpec[]> {
    void query;
    return [];
  },

  async listDashboards(query?: string): Promise<Dashboard[]> {
    void query;
    return [];
  },

  async listExports(query?: string): Promise<ExportJob[]> {
    void query;
    return [];
  },

  async getPivot(_datasetId?: string): Promise<PivotTable> {
    void _datasetId;
    return {
      rowField: "Branch",
      colField: "Category",
      valueField: "Amount",
      rows: [],
      cols: [],
      cells: [],
    };
  },

  async createReport(_input: Omit<SavedReport, "id" | "updatedAt">) {
    throw new Error(NOT_READY);
  },

  async createDashboard(_input: Omit<Dashboard, "id" | "updatedAt" | "widgetCount">) {
    throw new Error(NOT_READY);
  },

  async enqueueExport(_input: Omit<ExportJob, "id" | "createdAt" | "status" | "bytes">) {
    throw new Error(NOT_READY);
  },
};
