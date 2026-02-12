const SAMPLE_TABLES = [
  {
    name: 'Sales',
    columns: ['Date', 'Region', 'Channel', 'Revenue', 'Units'],
    rowCount: 18230,
    updatedAt: '2026-01-10T13:22:10Z',
  },
  {
    name: 'Inventory',
    columns: ['SKU', 'Warehouse', 'OnHand', 'Reserved', 'ReorderPoint'],
    rowCount: 9300,
    updatedAt: '2026-01-11T09:12:00Z',
  },
  {
    name: 'Forecast',
    columns: ['Week', 'Region', 'ExpectedDemand', 'Confidence'],
    rowCount: 544,
    updatedAt: '2026-01-09T03:02:50Z',
  },
];

export async function scanSpreadsheet({ linkName }) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return SAMPLE_TABLES.map((table) => ({
    ...table,
    id: `${linkName}-${table.name}`.toLowerCase(),
    source: linkName,
    health: Math.random() > 0.2 ? 'healthy' : 'warning',
  }));
}

export function buildQueryPlan(table, query) {
  return {
    table: table.name,
    query,
    estimatedScanRows: Math.round(table.rowCount * 0.12),
    cacheHitRatio: `${Math.round(70 + Math.random() * 25)}%`,
    executionMs: Math.round(150 + Math.random() * 300),
  };
}
