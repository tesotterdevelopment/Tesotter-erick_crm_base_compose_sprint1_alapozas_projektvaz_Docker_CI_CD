// In-memory sample data used when NEXT_PUBLIC_USE_MOCKS=true.
// Mutations from the mock handlers live until the page is reloaded.

import type { Activity, Customer, CustomerStatus, Deal, DealStage, Task, User } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * DAY).toISOString();

export const users: User[] = [
  { id: "u1", name: "Erik", email: "erik@tesotter.dev", role: "ADMIN", active: true, createdAt: daysAgo(90) },
  { id: "u2", name: "Rudi", email: "rudi@tesotter.dev", role: "SALES", active: true, createdAt: daysAgo(60) },
  { id: "u3", name: "Gergő", email: "gergo@tesotter.dev", role: "SALES", active: true, createdAt: daysAgo(60) },
  { id: "u4", name: "Sebi", email: "sebi@tesotter.dev", role: "VIEWER", active: true, createdAt: daysAgo(60) },
];

/** The mock "logged in" user. */
export const currentUser = users[0];

const companies: [string, string, CustomerStatus, string][] = [
  ["Balog Kft.", "Fuvarozás", "ACTIVE", "Budapest"],
  ["Kovács és Társa Bt.", "Építőipar", "ACTIVE", "Győr"],
  ["Napfény Pékség Kft.", "Élelmiszeripar", "PROSPECT", "Szeged"],
  ["Duna Logisztika Zrt.", "Fuvarozás", "ACTIVE", "Budapest"],
  ["Zöldkert Kft.", "Kertészet", "INACTIVE", "Pécs"],
  ["Mátra Informatika Kft.", "IT", "ACTIVE", "Eger"],
  ["Tisza Energia Zrt.", "Energetika", "PROSPECT", "Debrecen"],
  ["Hegyi Autószerviz Bt.", "Autóipar", "ACTIVE", "Miskolc"],
  ["Balaton Hotel Kft.", "Turizmus", "ACTIVE", "Siófok"],
  ["Nagy Ügyvédi Iroda", "Jog", "PROSPECT", "Budapest"],
  ["Pannon Bútor Kft.", "Bútoripar", "ACTIVE", "Veszprém"],
  ["Kék Duna Hajózási Kft.", "Turizmus", "INACTIVE", "Budapest"],
  ["Alföldi Gabona Zrt.", "Mezőgazdaság", "ACTIVE", "Kecskemét"],
  ["Szabó Nyomda Kft.", "Nyomdaipar", "PROSPECT", "Székesfehérvár"],
  ["Vértes Gépgyártó Kft.", "Gépipar", "ACTIVE", "Tatabánya"],
  ["Rába Fémfeldolgozó Kft.", "Fémipar", "ACTIVE", "Győr"],
  ["Bükk Vendéglátó Bt.", "Vendéglátás", "PROSPECT", "Miskolc"],
  ["Zala Tej Kft.", "Élelmiszeripar", "ACTIVE", "Zalaegerszeg"],
  ["Körös Textil Kft.", "Textilipar", "INACTIVE", "Békéscsaba"],
  ["Mecsek Pharma Zrt.", "Gyógyszeripar", "ACTIVE", "Pécs"],
  ["Hortobágy Agro Kft.", "Mezőgazdaság", "PROSPECT", "Hajdúszoboszló"],
  ["Sopron Bor Kft.", "Borászat", "ACTIVE", "Sopron"],
  ["Szinva Szoftver Kft.", "IT", "ACTIVE", "Miskolc"],
  ["Ipoly Építő Bt.", "Építőipar", "PROSPECT", "Balassagyarmat"],
  ["Őrség Fafeldolgozó Kft.", "Faipar", "ACTIVE", "Őriszentpéter"],
];

export const customers: Customer[] = companies.map(([name, industry, status, city], i) => ({
  id: `c${i + 1}`,
  name,
  taxNumber: `${String(12345678 + i * 1111).padStart(8, "0")}-2-${String(10 + (i % 30)).padStart(2, "0")}`,
  status,
  industry,
  contacts: [
    { name: `Kapcsolattartó ${i + 1}`, email: `kapcsolat${i + 1}@example.hu`, phone: "+36 30 123 4567", role: "Ügyvezető" },
  ],
  address: { city, zip: "1000", street: "Fő utca 1." },
  ownerUserId: users[i % 3].id,
  createdAt: daysAgo(60 - i),
  updatedAt: daysAgo(i % 10),
  tags: i % 4 === 0 ? ["kiemelt"] : [],
}));

const dealSeeds: [string, number, DealStage, number, number][] = [
  // title, value, stage, days since last activity, days until close
  ["Éves szállítási keretszerződés", 2_500_000, "NEGOTIATION", 9, 5],
  ["Raktárbővítés tanácsadás", 800_000, "NEW", 1, 30],
  ["Pékségi kasszarendszer", 450_000, "QUALIFIED", 12, 14],
  ["Flottakövetés bevezetése", 3_200_000, "NEGOTIATION", 2, 20],
  ["Szerver karbantartási szerződés", 1_200_000, "WON", 3, -2],
  ["Napelemes pilot projekt", 5_000_000, "QUALIFIED", 8, 45],
  ["Szezonális szálláskezelő", 600_000, "LOST", 20, -10],
  ["Gyártósor-monitoring", 2_100_000, "NEW", 0, 60],
];

export const deals: Deal[] = dealSeeds.map(([title, estimatedValue, stage, idleDays, closeIn], i) => ({
  id: `d${i + 1}`,
  customerId: customers[i].id,
  title,
  stage,
  estimatedValue,
  currency: "HUF",
  closeDateExpected: daysFromNow(closeIn),
  ownerUserId: users[i % 3].id,
  lastActivityAt: daysAgo(idleDays),
  history:
    stage === "NEW"
      ? []
      : [{ fromStage: "NEW", toStage: stage, changedAt: daysAgo(idleDays), byUserId: users[i % 3].id }],
}));

export const tasks: Task[] = [
  { id: "t1", relatedTo: { type: "DEAL", id: "d1" }, title: "Ajánlat kiküldése", dueDate: daysFromNow(1), status: "OPEN", assigneeUserId: currentUser.id, createdAt: daysAgo(3) },
  { id: "t2", relatedTo: { type: "CUSTOMER", id: "c2" }, title: "Visszahívás az árazás miatt", dueDate: daysAgo(2), status: "OVERDUE", assigneeUserId: currentUser.id, createdAt: daysAgo(6) },
  { id: "t3", relatedTo: { type: "DEAL", id: "d4" }, title: "Szerződéstervezet egyeztetése", dueDate: daysFromNow(4), status: "OPEN", assigneeUserId: currentUser.id, createdAt: daysAgo(1) },
  { id: "t4", relatedTo: { type: "CUSTOMER", id: "c6" }, title: "Bemutató időpont egyeztetése", dueDate: daysFromNow(7), status: "OPEN", assigneeUserId: "u2", createdAt: daysAgo(2) },
];

export const activities: Activity[] = [
  { id: "a1", relatedTo: { type: "CUSTOMER", id: "c1" }, type: "CALL", text: "Felhívtam, érdeklődnek az árajánlat iránt.", authorUserId: "u1", createdAt: daysAgo(9) },
  { id: "a2", relatedTo: { type: "CUSTOMER", id: "c1" }, type: "EMAIL", text: "Elküldtem a referencia listát.", authorUserId: "u2", createdAt: daysAgo(7) },
  { id: "a3", relatedTo: { type: "CUSTOMER", id: "c1" }, type: "MEETING", text: "Személyes megbeszélés a telephelyen.", authorUserId: "u1", createdAt: daysAgo(4) },
  { id: "a4", relatedTo: { type: "CUSTOMER", id: "c1" }, type: "NOTE", text: "Döntés várhatóan a hónap végén.", authorUserId: "u3", createdAt: daysAgo(1) },
  { id: "a5", relatedTo: { type: "DEAL", id: "d1" }, type: "STAGE_CHANGE", text: "NEW → NEGOTIATION", authorUserId: "u1", createdAt: daysAgo(9) },
];
