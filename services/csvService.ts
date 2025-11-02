
import { RecordItem } from '../types';

const toCsvRow = (row: string[]): string => {
  return row.map(value => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(',');
};

export const generateCsvContent = (data: RecordItem[]): string => {
  if (data.length === 0) {
    return '';
  }
  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(header => (item as any)[header]));

  return [
    toCsvRow(headers),
    ...rows.map(row => toCsvRow(row))
  ].join('\n');
};


export const downloadCsv = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
