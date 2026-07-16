/**
 * One-off helper to inspect BP-data.pdf structure.
 * Run: node scripts/extract-bp-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, "..", "data", "excel", "BP-data.pdf");

const buffer = fs.readFileSync(pdfPath);
const parser = new PDFParse({ data: buffer });
const textResult = await parser.getText();
console.log("PAGES:", textResult.total);
console.log("--- TEXT (first 15000 chars) ---");
console.log(textResult.text.slice(0, 15000));

try {
  const tableResult = await parser.getTable();
  console.log("\n--- TABLES count ---", tableResult?.tables?.length ?? 0);
  if (tableResult?.tables?.length) {
    for (let i = 0; i < Math.min(3, tableResult.tables.length); i++) {
      console.log(`\n--- TABLE ${i} (${tableResult.tables[i].length} rows) ---`);
      console.log(JSON.stringify(tableResult.tables[i].slice(0, 8), null, 2));
    }
  }
} catch (e) {
  console.log("getTable error:", e.message);
}

await parser.destroy();
