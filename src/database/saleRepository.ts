import { getDatabase } from './database';

import type {
  Sale,
  DashboardStats,
} from '../types/models';

export async function getSalesByClientId(
  clientId: number
): Promise<Sale[]> {
  const db = await getDatabase();

  return db.getAllAsync<Sale>(
    `
    SELECT id, client_id, amount, date
    FROM sales
    WHERE client_id = ?
    ORDER BY date DESC, id DESC
    `,
    [clientId]
  );
}

export async function createSale(
  clientId: number,
  amount: number,
  date: string
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
    INSERT INTO sales (client_id, amount, date)
    VALUES (?, ?, ?)
    `,
    [clientId, amount, date]
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDatabase();

  const summary = await db.getFirstAsync<{
    clientCount: number;
    saleCount: number;
    revenue: number;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM clients) AS clientCount,
      (SELECT COUNT(*) FROM sales) AS saleCount,
      (SELECT COALESCE(SUM(amount), 0) FROM sales) AS revenue
  `);

  const monthly = await db.getAllAsync<{
    month: string;
    total: number;
  }>(`
    SELECT month, total FROM (
      SELECT
        SUBSTR(date, 1, 7) AS month,
        SUM(amount) AS total
      FROM sales
      GROUP BY SUBSTR(date, 1, 7)
      ORDER BY month DESC
      LIMIT 6
    )
    ORDER BY month ASC
  `);

  return {
    clientCount: summary?.clientCount ?? 0,
    saleCount: summary?.saleCount ?? 0,
    revenue: summary?.revenue ?? 0,
    monthlySales: monthly.map((item) => ({
      label: item.month.slice(5),
      value: item.total,
    })),
  };
}