// src/lib/parseImage.ts
import { createWorker } from "tesseract.js";
import fs from "fs/promises";
import path from "path";
import os from "os";

export default async function parseImage(buffer: Buffer) {
  try {
    const temp = path.join(os.tmpdir(), `ocr-${Date.now()}.png`);
    await fs.writeFile(temp, buffer);

    const worker = await createWorker("eng");

    const {
      data: { text },
    } = await worker.recognize(temp);

    await worker.terminate();
    await fs.unlink(temp);

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return {
      rawText: text,
      rows: lines.map((l) => ({ text: l })),
    };
  } catch (error) {
    return { error: "OCR failed", detail: String(error) };
  }
}
