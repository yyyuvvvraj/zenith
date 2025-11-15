import * as XLSX from "xlsx";

export default async function parseExcel(buffer: Buffer) {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
  const csv = XLSX.utils.sheet_to_csv(ws);

  return { rows, rawText: csv };
}
