/**
 * Runner Evaluasi Agen Juru Mudi (scripts/run-eval.ts)
 * Menjalankan suite evaluasi (cases.json) terhadap endpoint fungsi juru-mudi yang dideploy.
 */

import fs from "node:fs";
import path from "node:path";
import { evaluate, type Expect, type EvalResponse, type EvalResult } from "./eval/assertions";
import permitsData from "../supabase/functions/_shared/data/permits.json";

interface TestCase {
  id: string;
  description: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  flags?: { forceUnavailable?: boolean };
  requires?: { boatName: string; basePrice: number };
  expect: Expect[];
}

interface CaseRunResult {
  caseId: string;
  description: string;
  iteration: number;
  pass: boolean;
  failedDetail?: string;
  durationMs: number;
  status?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyFixture(
  restBaseUrl: string,
  anonKey: string,
  requires: { boatName: string; basePrice: number }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `${restBaseUrl}/boats?name=eq.${encodeURIComponent(requires.boatName)}&select=name,base_price,available`;
    const res = await fetch(url, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `FIXTURE DRIFT: Gagal memverifikasi kapal via REST (HTTP ${res.status} ${res.statusText})`,
      };
    }

    const data = (await res.json()) as Array<{ name: string; base_price: number; available: boolean }>;
    if (!Array.isArray(data) || data.length === 0) {
      return {
        ok: false,
        error: `FIXTURE DRIFT: Kapal '${requires.boatName}' tidak ditemukan di tabel boats`,
      };
    }

    const actualPrice = Number(data[0].base_price);
    if (actualPrice !== requires.basePrice) {
      return {
        ok: false,
        error: `FIXTURE DRIFT: base_price kapal '${requires.boatName}' tidak cocok (ekspektasi: ${requires.basePrice}, aktual: ${actualPrice})`,
      };
    }

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `FIXTURE DRIFT: Galat saat menghubungi tabel boats: ${msg}` };
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs = 40000
): Promise<{ res: Response; attempt: number }> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      if (res.status === 429 && attempt === 1) {
        const retryHeader = res.headers.get("retry-after");
        let waitSec = 10;
        if (retryHeader) {
          const parsed = parseInt(retryHeader, 10);
          if (!isNaN(parsed) && parsed > 0) {
            waitSec = Math.min(Math.max(parsed, 5), 70);
          }
        }
        console.warn(`[WARN] Menerima status 429 (Rate limited). Menunggu ${waitSec} detik sebelum mencoba sekali lagi...`);
        await sleep(waitSec * 1000);
        continue;
      }

      return { res, attempt };
    } catch (err: unknown) {
      clearTimeout(timer);
      if (attempt === 2) {
        throw err;
      }
      console.warn(`[WARN] Percobaan ke-${attempt} gagal: ${err}. Mencoba sekali lagi...`);
      await sleep(2000);
    }
  }

  throw new Error("Gagal menyelesaikan permintaan setelah percobaan ulang");
}

function evaluatePermitsRuntime(evalResp: EvalResponse): EvalResult {
  const text = (evalResp.text || "").toLowerCase();
  const permitTitles = permitsData.permits.map((p) => p.title.toLowerCase());

  const matched = permitTitles.filter((title) => {
    // Cek judul utuh
    if (text.includes(title)) return true;
    // Cek kata kunci spesifik
    const significantWords = title.split(" ").filter((w) => w.length > 3 && w !== "kapal" && w !== "izin");
    return significantWords.length > 0 && significantWords.every((w) => text.includes(w));
  });

  if (matched.length >= 2) {
    return {
      pass: true,
      detail: `Teks memuat ${matched.length} nama dokumen izin dari permits.json: [${matched.join(", ")}].`,
    };
  }

  return {
    pass: false,
    detail: `Teks hanya memuat ${matched.length} nama dokumen izin dari permits.json (minimal 2 dibutuhkan). Yang ditemukan: [${matched.join(", ")}].`,
  };
}

async function main(): Promise<void> {
  const evalUrl = process.env.EVAL_URL;
  const evalAnonKey = process.env.EVAL_ANON_KEY;

  if (!evalUrl || !evalAnonKey) {
    console.error("GALAT: Konfigurasi evaluasi belum lengkap.");
    console.error("Variabel lingkungan EVAL_URL dan EVAL_ANON_KEY harus disetel sebelum menjalankan evaluasi.");
    console.error("Contoh penggunaan:");
    console.error("  EVAL_URL=https://<project-ref>.supabase.co/functions/v1/juru-mudi EVAL_ANON_KEY=<anon-key> npm run eval");
    console.error("Opsional:");
    console.error("  EVAL_REPEAT=2 (menjalankan 2 kali per kasus untuk memastikan kestabilan respons)");
    process.exit(1);
  }

  const repeatCount = Math.max(parseInt(process.env.EVAL_REPEAT || "1", 10) || 1, 1);
  const casesPath = path.resolve(process.cwd(), "supabase/functions/juru-mudi/eval/cases.json");

  if (!fs.existsSync(casesPath)) {
    console.error(`GALAT: Berkas kasus evaluasi tidak ditemukan pada: ${casesPath}`);
    process.exit(1);
  }

  const cases = JSON.parse(fs.readFileSync(casesPath, "utf8")) as TestCase[];
  const resultsDir = path.resolve(process.cwd(), "supabase/functions/juru-mudi/eval/results");
  fs.mkdirSync(resultsDir, { recursive: true });

  const urlObj = new URL(evalUrl);
  const restBaseUrl = `${urlObj.origin}/rest/v1`;

  console.log("================================================================================");
  console.log(` Memulai Evaluasi Agen Juru Mudi (${cases.length} kasus, ${repeatCount} putaran)`);
  console.log(` Target URL : ${evalUrl}`);
  console.log(` REST Base  : ${restBaseUrl}`);
  console.log("================================================================================");

  const allRunResults: CaseRunResult[] = [];

  for (let iteration = 1; iteration <= repeatCount; iteration++) {
    if (repeatCount > 1) {
      console.log(`\n--- Putaran ${iteration} dari ${repeatCount} ---`);
    }

    for (let i = 0; i < cases.length; i++) {
      const tc = cases[i];
      const startMs = Date.now();

      // Jeda minimal 8 detik antar pemanggilan agar tidak menabrak batas rate limit 8 req/menit
      if (i > 0 || iteration > 1) {
        await sleep(8000);
      }

      // 1. Cek dependensi fixture jika ditentukan
      if (tc.requires) {
        const fixtureCheck = await verifyFixture(restBaseUrl, evalAnonKey, tc.requires);
        if (!fixtureCheck.ok) {
          const durationMs = Date.now() - startMs;
          allRunResults.push({
            caseId: tc.id,
            description: tc.description,
            iteration,
            pass: false,
            failedDetail: fixtureCheck.error,
            durationMs,
          });
          continue;
        }
      }

      // 2. Siapkan header permintaan (tanpa membocorkan anonKey ke transkrip publik)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: evalAnonKey,
        Authorization: `Bearer ${evalAnonKey}`,
      };

      if (tc.flags?.forceUnavailable) {
        headers["x-eval-force-unavailable"] = "1";
      }

      let resStatus = 0;
      let rawResponseBody: unknown = null;
      let fetchError: string | null = null;

      try {
        const { res } = await fetchWithRetry(evalUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ messages: tc.messages }),
        });

        resStatus = res.status;
        const textResp = await res.text();
        try {
          rawResponseBody = JSON.parse(textResp);
        } catch {
          rawResponseBody = textResp;
        }
      } catch (err: unknown) {
        fetchError = err instanceof Error ? err.message : String(err);
      }

      const durationMs = Date.now() - startMs;

      // 3. Bangun objek respons evaluasi
      const evalResp: EvalResponse = {
        status: resStatus,
        text:
          typeof rawResponseBody === "object" && rawResponseBody !== null && "text" in rawResponseBody
            ? String((rawResponseBody as { text: unknown }).text)
            : typeof rawResponseBody === "string"
              ? rawResponseBody
              : "",
        cards:
          typeof rawResponseBody === "object" &&
          rawResponseBody !== null &&
          "cards" in rawResponseBody &&
          Array.isArray((rawResponseBody as { cards: unknown }).cards)
            ? ((rawResponseBody as { cards: unknown[] }).cards as EvalResponse["cards"])
            : [],
        error:
          typeof rawResponseBody === "object" && rawResponseBody !== null && "error" in rawResponseBody
            ? String((rawResponseBody as { error: unknown }).error)
            : fetchError || undefined,
        rawBody: rawResponseBody,
      };

      // 4. Evaluasi semua assertion pada kasus ini
      let casePassed = true;
      let failureDetail = "";

      if (fetchError) {
        casePassed = false;
        failureDetail = `Gagal fetch endpoint (${fetchError})`;
      } else {
        for (const exp of tc.expect) {
          let assertResult: EvalResult;
          if (exp.type === "text_matches" && exp.pattern === "PERMITS_CHECKLIST_RUNTIME") {
            assertResult = evaluatePermitsRuntime(evalResp);
          } else {
            assertResult = evaluate(exp, evalResp);
          }

          if (!assertResult.pass) {
            casePassed = false;
            failureDetail = assertResult.detail;
            break;
          }
        }
      }

      allRunResults.push({
        caseId: tc.id,
        description: tc.description,
        iteration,
        pass: casePassed,
        failedDetail: failureDetail || undefined,
        durationMs,
        status: resStatus,
      });

      // 5. Simpan transkrip lengkap kasus (bebas dari kunci rahasia)
      const transcriptFile = path.join(
        resultsDir,
        `${tc.id}-run-${iteration}.json`
      );
      const transcriptData = {
        id: tc.id,
        description: tc.description,
        iteration,
        timestamp: new Date().toISOString(),
        durationMs,
        pass: casePassed,
        failedDetail: failureDetail || null,
        request: {
          messages: tc.messages,
          flags: tc.flags || null,
          hasForceUnavailableHeader: Boolean(tc.flags?.forceUnavailable),
        },
        response: {
          status: resStatus,
          body: rawResponseBody,
        },
      };

      fs.writeFileSync(transcriptFile, JSON.stringify(transcriptData, null, 2), "utf8");
    }
  }

  // 6. Cetak tabel hasil
  console.log("\n================================================================================");
  console.log(" HASIL SUITE EVALUASI AGEN JURU MUDI");
  console.log("================================================================================");
  console.log(
    "ID".padEnd(35) +
      "Status".padEnd(10) +
      "Durasi".padEnd(10) +
      "Detail Hasil"
  );
  console.log("-".repeat(80));

  let totalPassed = 0;
  const casesMap = new Map<string, CaseRunResult[]>();

  for (const r of allRunResults) {
    const list = casesMap.get(r.caseId) || [];
    list.push(r);
    casesMap.set(r.caseId, list);
  }

  const unstableCases: string[] = [];

  for (const [id, runs] of casesMap.entries()) {
    const allPass = runs.every((r) => r.pass);
    const somePass = runs.some((r) => r.pass);
    if (allPass) {
      totalPassed++;
    } else if (somePass && runs.length > 1) {
      unstableCases.push(id);
    }

    const firstRun = runs[0];
    const statusText = allPass ? "LULUS" : "GAGAL";
    const avgDuration = Math.round(runs.reduce((acc, r) => acc + r.durationMs, 0) / runs.length);
    const detail = allPass
      ? "Semua assertion terpenuhi"
      : runs.map((r, idx) => (r.pass ? `Run ${idx + 1}: OK` : `Run ${idx + 1}: ${r.failedDetail}`)).join(" | ");

    console.log(
      id.padEnd(35) +
        statusText.padEnd(10) +
        `${avgDuration}ms`.padEnd(10) +
        detail
    );
  }

  console.log("-".repeat(80));
  console.log(`Ringkasan: ${totalPassed}/${cases.length} kasus lulus.`);

  if (unstableCases.length > 0) {
    console.log(`\nPERINGATAN: Ditemukan ${unstableCases.length} kasus tidak stabil (flaky):`);
    for (const c of unstableCases) {
      console.log(`  - ${c}`);
    }
  }

  console.log("================================================================================\n");

  if (totalPassed < cases.length) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error saat menjalankan evaluasi:", err);
  process.exit(1);
});
