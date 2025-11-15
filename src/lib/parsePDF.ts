// src/lib/parsePDF.ts
export default async function parsePDF(buffer: Buffer) {
  try {
    // Dynamically import pdf-parse (handle both ESM and CJS shapes)
const mod: unknown = await import("pdf-parse");

// Tell TS that module shape is either default or direct function
type PDFParseFn = (data: Buffer) => Promise<{ text: string }>;

const pdf: PDFParseFn =
  (mod as { default?: PDFParseFn }).default ??
  (mod as PDFParseFn);

    // Call parser
    const data = await pdf(buffer);

    const text: string = data.text || "";
    
    const lines: string[] = text
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    return {
      rawText: text,
      rows: lines.map((line: string) => ({ text: line })),
    };

  } catch (error) {
    return {
      error: "PDF parsing failed",
      detail: String(error),
    };
  }
}
