export type Category = "Crypto" | "Sports" | "Politics" | "Other";

export function inferCategory(question: string): Category {
  const q = question.toLowerCase();

  if (/\b(avax|btc|bitcoin|eth|ethereum|crypto|token|coin|price)\b/.test(q) || /\$\d/.test(q)) {
    return "Crypto";
  }
  if (/\b(beat|win|match|cup|game|team|score|league|final|championship|quarterfinal)\b/.test(q)) {
    return "Sports";
  }
  if (/\b(election|president|vote|senate|congress|policy|minister|party)\b/.test(q)) {
    return "Politics";
  }
  return "Other";
}