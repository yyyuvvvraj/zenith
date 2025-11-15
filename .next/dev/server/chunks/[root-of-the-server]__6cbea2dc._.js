module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/parseExcel.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>parseExcel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-route] (ecmascript)");
;
async function parseExcel(buffer) {
    const wb = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["read"](buffer, {
        type: "buffer"
    });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(ws, {
        defval: ""
    });
    const csv = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].sheet_to_csv(ws);
    return {
        rows,
        rawText: csv
    };
}
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/src/lib/parseCSV.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>parseCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/papaparse/papaparse.js [app-route] (ecmascript)");
;
async function parseCSV(buffer) {
    const text = buffer.toString("utf8");
    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].parse(text, {
        header: true
    });
    return {
        rows: parsed.data,
        rawText: text
    };
}
}),
"[project]/src/lib/parsePDF.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/parsePDF.ts
__turbopack_context__.s([
    "default",
    ()=>parsePDF
]);
async function parsePDF(buffer) {
    try {
        // Dynamically import pdf-parse (handle both ESM and CJS shapes)
        const mod = await __turbopack_context__.A("[project]/node_modules/pdf-parse/dist/pdf-parse/esm/index.js [app-route] (ecmascript, async loader)");
        const pdf = mod.default ?? mod;
        // Call parser
        const data = await pdf(buffer);
        const text = data.text || "";
        const lines = text.split("\n").map((line)=>line.trim()).filter((line)=>line.length > 0);
        return {
            rawText: text,
            rows: lines.map((line)=>({
                    text: line
                }))
        };
    } catch (error) {
        return {
            error: "PDF parsing failed",
            detail: String(error)
        };
    }
}
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/worker_threads [external] (worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("worker_threads", () => require("worker_threads"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/src/lib/parseImage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/parseImage.ts
__turbopack_context__.s([
    "default",
    ()=>parseImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tesseract$2e$js$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tesseract.js/src/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
;
;
;
;
async function parseImage(buffer) {
    try {
        const temp = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir(), `ocr-${Date.now()}.png`);
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(temp, buffer);
        const worker = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tesseract$2e$js$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createWorker"])("eng");
        const { data: { text } } = await worker.recognize(temp);
        await worker.terminate();
        await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].unlink(temp);
        const lines = text.split("\n").map((l)=>l.trim()).filter(Boolean);
        return {
            rawText: text,
            rows: lines.map((l)=>({
                    text: l
                }))
        };
    } catch (error) {
        return {
            error: "OCR failed",
            detail: String(error)
        };
    }
}
}),
"[project]/src/app/api/parse/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parseExcel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/parseExcel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parseCSV$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/parseCSV.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parsePDF$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/parsePDF.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parseImage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/parseImage.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(req) {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "No file uploaded"
    }, {
        status: 400
    });
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const buffer = Buffer.from(await file.arrayBuffer());
    let parsed;
    if ([
        "xlsx",
        "xls"
    ].includes(ext)) parsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parseExcel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(buffer);
    else if (ext === "csv") parsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parseCSV$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(buffer);
    else if (ext === "pdf") parsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parsePDF$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(buffer);
    else parsed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$parseImage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(buffer);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        parsed
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6cbea2dc._.js.map