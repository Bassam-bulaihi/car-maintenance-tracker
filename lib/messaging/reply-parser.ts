// Pure parsing of one inbound WhatsApp reply — no I/O, so it's trivially
// testable and reusable from the webhook route.
//
// docs/PRD.md §7.5: "reply handling must still tolerate free-text variants
// of 'تم / تم التغيير / نعم' and 'لم يتم / لا', in both Arabic and English"
// on top of the quick-reply buttons being the primary path. Twilio's
// WhatsApp quick-reply Content Templates surface the tapped button's title
// as the message Body (and, depending on API version, may also include
// ButtonText/ButtonPayload) — this checks whichever button-specific field is
// present first, then falls back to Body, so it's correct either way.

export type ParsedReply =
  | { kind: "confirmation"; value: "done" | "not_done" }
  | { kind: "odometer"; value: number }
  | { kind: "unparseable" };

// Checked in this order deliberately: "لم يتم" contains "تم" as a substring,
// so the not-done phrases must be matched before the shorter done tokens or
// a "not done" reply would be misread as "done".
const NOT_DONE_EXACT = new Set(["لم يتم", "لم", "لا", "no", "not done", "n"]);
const DONE_EXACT = new Set(["تم التغيير", "تم", "نعم", "yes", "done", "y"]);

function normalize(text: string) {
  return text
    .trim()
    .replace(/[.!؟?]+$/g, "")
    .trim()
    .toLowerCase();
}

export function parseInboundReply(fields: {
  Body?: string;
  ButtonText?: string;
  ButtonPayload?: string;
}): ParsedReply {
  const buttonSignal = fields.ButtonPayload || fields.ButtonText;
  const body = (fields.Body ?? "").trim();
  const candidate = normalize(buttonSignal ?? body);

  if (NOT_DONE_EXACT.has(candidate)) return { kind: "confirmation", value: "not_done" };
  if (DONE_EXACT.has(candidate)) return { kind: "confirmation", value: "done" };

  if (/^\d+$/.test(body)) {
    const value = Number(body);
    if (Number.isSafeInteger(value)) return { kind: "odometer", value };
  }

  return { kind: "unparseable" };
}
