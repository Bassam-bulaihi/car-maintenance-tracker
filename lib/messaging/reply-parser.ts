// Pure parsing of one inbound Telegram text — no I/O, so the webhook logic
// and the tests share exactly the same rules.
//
// docs/PRD.md §7.5: buttons are the primary path, but free-text variants of
// "تم / تم التغيير / نعم" and "لم يتم / لا" must be tolerated in Arabic and
// English, and an odometer answer must be a plain number.

export type ParsedReply =
  | { kind: "confirmation"; value: "done" | "not_done" }
  | { kind: "odometer"; value: number }
  | { kind: "unparseable" };

// Checked before the done phrases on purpose: "لم يتم" contains "تم", so a
// "not done" reply must never fall through to the shorter "done" match.
const NOT_DONE = new Set([
  "لم يتم",
  "لم يتم التغيير",
  "ما تم",
  "لم",
  "لا",
  "no",
  "not done",
  "not yet",
  "n",
]);
const DONE = new Set(["تم", "تم التغيير", "نعم", "ايوه", "أيوه", "yes", "done", "y", "ok done"]);

// Arabic-Indic (U+0660–0669) and Extended/Persian (U+06F0–06F9) digits.
function toLatinDigits(text: string) {
  return text
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

function normalizeWords(text: string) {
  return text
    .trim()
    .replace(/[.!؟?،,]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * "25000", "25,000", "25 000", "٢٥٠٠٠", "25000 km", "25000 كم" → 25000.
 * Anything with other content (decimals, words, signs) is not a reading.
 */
export function parseOdometer(text: string): number | null {
  const cleaned = toLatinDigits(text)
    .trim()
    .toLowerCase()
    .replace(/\s*(km|كم|كيلو|كيلومتر)$/u, "")
    .replace(/[\s,٬'_]/g, "");
  if (!/^\d{1,7}$/.test(cleaned)) return null;
  return Number(cleaned);
}

export function parseConfirmation(text: string): "done" | "not_done" | null {
  const candidate = normalizeWords(text);
  if (NOT_DONE.has(candidate)) return "not_done";
  if (DONE.has(candidate)) return "done";
  return null;
}

export function parseReply(text: string): ParsedReply {
  const confirmation = parseConfirmation(text);
  if (confirmation) return { kind: "confirmation", value: confirmation };
  const reading = parseOdometer(text);
  if (reading !== null) return { kind: "odometer", value: reading };
  return { kind: "unparseable" };
}
