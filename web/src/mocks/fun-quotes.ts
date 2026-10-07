import type { FunQuote } from "@/lib/types";

// Local fallback for the "Mókamester" widget until GET /api/fun/quote exists (R10).
export const funQuotes: FunQuote[] = [
  { text: "Ma ne csak hívd vissza az ügyfelet — jegyzeteld is le. A jövőbeli éned hálás lesz." },
  { text: "A legjobb CRM az, amit ki is töltenek.", author: "Ismeretlen sales-guru" },
  { text: "Egy nyitott feladat olyan, mint egy nyitott hűtő: előbb-utóbb valaki szól miatta." },
  { text: "Ma ezt csináld: zárj le egy feladatot, mielőtt felveszel kettőt." },
  { text: "Ha egy üzlet 7 napja nem mozdult, nem alszik — csak hideg.", author: "A dashboard" },
  { text: "Kávé nélkül nincs pipeline.", author: "Gergő, valószínűleg" },
  { text: "A „majdnem kész” nem kész.", author: "Definition of Done, 14. fejezet" },
  { text: "Ma ezt csináld: hívj fel valakit, akivel rég beszéltél. Ügyfelet, nem a nagymamád. Bár őt is." },
  { text: "Minden ügyfél ACTIVE, csak van, aki még nem tud róla." },
  { text: "Story pont nem óra. Az óra az óra.", author: "Sebi, sprint planningen" },
  { text: "Ma ezt csináld: nevezz el egy változót úgy, hogy holnap is értsd." },
  { text: "Nincs olyan merge konfliktus, amit egy jó napi státusz meg ne előzne." },
];
