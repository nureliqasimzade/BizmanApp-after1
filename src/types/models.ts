export type Client = {
  id: number;
  name: string;
  phone: string;
  email: string;
};

export type ClientSummary = Client & {
  salesCount: number;
  totalSales: number;
};

export type Sale = {
  id: number;
  client_id: number;
  amount: number;
  date: string;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type DashboardStats = {
  clientCount: number;
  saleCount: number;
  revenue: number;
  monthlySales: ChartPoint[];
};