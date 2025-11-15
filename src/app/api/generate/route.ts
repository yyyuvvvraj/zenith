import { NextResponse } from "next/server";
import parseExcel from "@/lib/parseExcel";
import parseCSV from "@/lib/parseCSV";
import parsePDF from "@/lib/parsePDF";
import parseImage from "@/lib/parseImage";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const buffer = Buffer.from(await file.arrayBuffer());

    let parsed;
    if (["xlsx", "xls"].includes(ext)) parsed = await parseExcel(buffer);
    else if (ext === "csv") parsed = await parseCSV(buffer);
    else if (ext === "pdf") parsed = await parsePDF(buffer);
    else parsed = await parseImage(buffer); // fallback to OCR

    return NextResponse.json({ ext, parsed });
  } catch (err) {
    console.error("Parse API error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
