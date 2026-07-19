export type DataSourceApp =
  | "resto_pos"
  | "inventory_plus"
  | "crm_plus"
  | "tracker"
  | "finance_plus"
  | "fleet_management";

export type Dataset = {
  id: string;
  name: string;
  app: DataSourceApp;
  reportMethod: string;
  fields: string[];
  rowCount: number;
  refreshedAt: string;
};

export type SavedReport = {
  id: string;
  name: string;
  datasetId: string;
  kind: "table" | "pivot" | "chart";
  owner: string;
  updatedAt: string;
};

export type ChartSpec = {
  id: string;
  name: string;
  type: "bar" | "line" | "pie";
  datasetId: string;
  metric: string;
  dimension: string;
  series: { label: string; value: number }[];
};

export type Dashboard = {
  id: string;
  name: string;
  description: string;
  widgetCount: number;
  shared: boolean;
  updatedAt: string;
};

export type ExportJob = {
  id: string;
  reportName: string;
  format: "csv" | "xlsx" | "pdf";
  status: "queued" | "running" | "done" | "failed";
  createdAt: string;
  bytes?: number;
};

export type PivotCell = {
  row: string;
  col: string;
  value: number;
};
