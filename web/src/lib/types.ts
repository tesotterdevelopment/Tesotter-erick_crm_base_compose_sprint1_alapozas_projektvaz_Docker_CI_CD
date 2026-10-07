// Domain types mirroring the MongoDB data model (plan, chapter 6).
// ObjectId and ISODate values arrive as strings in JSON, and the backend
// DTOs expose `_id` as `id`.

export type Id = string;
/** ISO-8601 date-time string, e.g. "2026-10-07T12:00:00Z". */
export type IsoDate = string;

// ---------- customers ----------

export type CustomerStatus = "ACTIVE" | "PROSPECT" | "INACTIVE";

export interface Contact {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface Address {
  city: string;
  zip: string;
  street: string;
}

export interface Customer {
  id: Id;
  name: string;
  taxNumber: string;
  status: CustomerStatus;
  industry?: string;
  contacts: Contact[];
  address?: Address;
  ownerUserId: Id;
  createdAt: IsoDate;
  updatedAt: IsoDate;
  tags: string[];
}

export interface CustomerInput {
  name: string;
  taxNumber: string;
  status: CustomerStatus;
  industry?: string;
  contacts?: Contact[];
  address?: Address;
  tags?: string[];
}

// ---------- deals ----------

export type DealStage = "NEW" | "QUALIFIED" | "NEGOTIATION" | "WON" | "LOST";

export interface StageChange {
  fromStage: DealStage;
  toStage: DealStage;
  changedAt: IsoDate;
  byUserId: Id;
}

export interface Deal {
  id: Id;
  customerId: Id;
  title: string;
  stage: DealStage;
  estimatedValue: number;
  currency: string;
  closeDateExpected?: IsoDate;
  ownerUserId: Id;
  lastActivityAt?: IsoDate;
  history: StageChange[];
}

export interface DealInput {
  customerId: Id;
  title: string;
  estimatedValue: number;
  currency?: string;
  closeDateExpected?: IsoDate;
}

// ---------- tasks & activities ----------

export type RelatedType = "CUSTOMER" | "DEAL";

export interface RelatedTo {
  type: RelatedType;
  id: Id;
}

export type TaskStatus = "OPEN" | "DONE" | "OVERDUE";

export interface Task {
  id: Id;
  relatedTo: RelatedTo;
  title: string;
  dueDate: IsoDate;
  status: TaskStatus;
  assigneeUserId: Id;
  createdAt: IsoDate;
}

export interface TaskInput {
  relatedTo: RelatedTo;
  title: string;
  dueDate: IsoDate;
  assigneeUserId?: Id;
}

export type ActivityType = "NOTE" | "CALL" | "EMAIL" | "MEETING" | "STAGE_CHANGE";

export interface Activity {
  id: Id;
  relatedTo: RelatedTo;
  type: ActivityType;
  text: string;
  authorUserId: Id;
  createdAt: IsoDate;
}

export interface ActivityInput {
  relatedTo: RelatedTo;
  type: Exclude<ActivityType, "STAGE_CHANGE">;
  text: string;
}

// ---------- users & auth ----------

export type UserRole = "ADMIN" | "SALES" | "VIEWER";

/** passwordHash is never sent to the client. */
export interface User {
  id: Id;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: IsoDate;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ---------- dashboard & fun ----------

export interface StageSummary {
  stage: DealStage;
  count: number;
  totalValue: number;
}

// Not fixed in the API contract yet (chapter 7) — agree with Gergő before Sprint 1 ends.
export interface DashboardSummary {
  activeCustomers: number;
  openDeals: number;
  openTasks: number;
  openDealsTotalValue: number;
  valueByStage: StageSummary[];
  hotDeals: Deal[];
}

export interface FunQuote {
  text: string;
  author?: string;
}
