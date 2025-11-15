import Papa from "papaparse";

export default async function parseCSV(buffer: Buffer) {
  const text = buffer.toString("utf8");
  const parsed = Papa.parse(text, { header: true });
  return { rows: parsed.data, rawText: text };
}
