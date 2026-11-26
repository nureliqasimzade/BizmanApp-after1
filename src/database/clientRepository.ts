import { getDatabase } from './database';

import type {
  Client,
  ClientSummary,
} from '../types/models';

export async function getClients(
  query = ''
): Promise<ClientSummary[]> {
  const db = await getDatabase();

  const pattern = `%${query.trim()}%`;
  return db.getAllAsync<ClientSummary>(
    `
    SELECT
      c.id,
      c.name,
      c.phone,
      c.email,
      COUNT(s.id) AS salesCount,
      COALESCE(SUM(s.amount), 0) AS totalSales
    FROM clients c
    LEFT JOIN sales s
      ON s.client_id = c.id
    WHERE
      c.name LIKE ?
      OR c.phone LIKE ?
      OR c.email LIKE ?
    GROUP BY
      c.id,
      c.name,
      c.phone,
      c.email
    ORDER BY c.id DESC
    `,
    [pattern, pattern, pattern]
  );
}

export async function getClientById(
  id: number
): Promise<Client | null> {
  const db = await getDatabase();

  return db.getFirstAsync<Client>(
    `
    SELECT id, name, phone, email
    FROM clients
    WHERE id = ?
    `,
    [id]
  );
}

export async function createClient(
  data: Pick<Client, 'name' | 'phone' | 'email'>
): Promise<number> {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
    INSERT INTO clients (name, phone, email)
    VALUES (?, ?, ?)
    `,
    [
      data.name.trim(),
      data.phone.trim(),
      data.email.trim(),
    ]
  );

  return result.lastInsertRowId;
}

export async function updateClient(
  id: number,
  data: Pick<Client, 'name' | 'phone' | 'email'>
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
    UPDATE clients
    SET name = ?, phone = ?, email = ?
    WHERE id = ?
    `,
    [
      data.name.trim(),
      data.phone.trim(),
      data.email.trim(),
      id,
    ]
  );
}

export async function deleteClient(
  id: number
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    'DELETE FROM clients WHERE id = ?',
    [id]
  );
}