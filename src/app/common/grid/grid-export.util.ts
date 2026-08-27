import { GridColumnDef } from './grid.models';

/**
 * Reusable utility to export any typed grid dataset into a CSV file with automatic quoting and browser download.
 * @param data Array of records to export.
 * @param columns Column mappings defining headers and property accessors.
 * @param filename Base filename for the downloaded CSV.
 */
export function exportGridToCsv<T>(
  data: T[],
  columns: GridColumnDef<T>[],
  filename: string = 'Export'
): void {
  if (!data || data.length === 0) return;

  const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`);
  const rows = data.map(row => {
    return columns.map(col => {
      let rawVal: any;
      if (typeof col.field === 'function') {
        rawVal = col.field(row);
      } else {
        rawVal = row[col.field];
      }

      if (rawVal === null || rawVal === undefined) return '""';
      const strVal = String(rawVal).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
