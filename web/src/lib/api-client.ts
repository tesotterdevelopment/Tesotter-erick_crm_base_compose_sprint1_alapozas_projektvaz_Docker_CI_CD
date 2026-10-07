// The single typed gateway for every API call in the app (plan, R1).
// No other module may call fetch() directly.

import { mockFetch } from "@/mocks/handlers";
import type {
  Activity,
  ActivityInput,
  AuthTokens,
  Customer,
  CustomerInput,
  CustomerStatus,
  DashboardSummary,
  Deal,
  DealInput,
  DealStage,
  FunQuote,
  Id,
  LoginRequest,
  Task,
  TaskInput,
  User,
} from "./types";

// ---------- response envelope (plan, chapter 7) ----------

export interface Meta {
  page: number;
  size: number;
  totalElements: number;
}

export interface ApiError {
  code: string;
  message: string;
  /** Field name -> validation message, for 400 responses. */
  fieldErrors?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  meta: Meta | null;
  error: ApiError | null;
}

export interface Page<T> {
  items: T[];
  meta: Meta;
}

export interface PageParams {
  page?: number;
  size?: number;
}

// ---------- configuration ----------

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// Kept in memory only; login/refresh handling arrives with R2 (TCRM-110).
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// ---------- errors ----------

const STATUS_MESSAGES: Record<number, string> = {
  400: "Hibás vagy hiányos adatok. Ellenőrizd a kitöltött mezőket.",
  401: "A munkameneted lejárt. Kérlek, jelentkezz be újra.",
  403: "Ehhez a művelethez nincs jogosultságod.",
  404: "A keresett elem nem található.",
  409: "Valaki közben módosította ezt az elemet. Töltsd újra az oldalt, és próbáld újra.",
  503: "A szolgáltatás átmenetileg nem elérhető. Próbáld újra pár perc múlva.",
};

function messageForStatus(status: number): string {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status >= 500) return "Váratlan szerverhiba történt. Próbáld újra később.";
  return "Nem sikerült végrehajtani a kérést.";
}

export class ApiClientError extends Error {
  constructor(
    /** Human-readable Hungarian message, safe to show in the UI. */
    message: string,
    /** HTTP status, or null when the server could not be reached. */
    readonly status: number | null,
    readonly code?: string,
    readonly fieldErrors?: Record<string, string>,
    /** Original backend message, for logging — not for the UI. */
    readonly detail?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }

  get isNetworkError(): boolean {
    return this.status === null;
  }
}

// ---------- core request ----------

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const init: RequestInit = { ...options, headers };

  let response: Response;
  try {
    response = USE_MOCKS ? await mockFetch(path, init) : await fetch(`${API_URL}${path}`, init);
  } catch (cause) {
    throw new ApiClientError(
      "Nem sikerült elérni a szervert. Ellenőrizd a kapcsolatot, vagy próbáld újra később.",
      null,
      "NETWORK_ERROR",
      undefined,
      cause instanceof Error ? cause.message : undefined,
    );
  }

  let body: ApiResponse<T> | null = null;
  if (response.status !== 204) {
    try {
      body = (await response.json()) as ApiResponse<T>;
    } catch {
      body = null;
    }
  }

  if (!response.ok || body?.error) {
    throw new ApiClientError(
      messageForStatus(response.status),
      response.status,
      body?.error?.code,
      body?.error?.fieldErrors,
      body?.error?.message,
    );
  }

  if (body === null) {
    if (response.status === 204) return { data: undefined as T, meta: null, error: null };
    throw new ApiClientError("A szerver érvénytelen választ adott.", response.status, "INVALID_RESPONSE");
  }

  return body;
}

/** Calls the API and returns the unwrapped `data` field. */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const body = await request<T>(path, options);
  return body.data;
}

/** Calls a paged list endpoint and returns the items together with `meta`. */
export async function apiFetchPage<T>(path: string, options?: RequestInit): Promise<Page<T>> {
  const body = await request<T[]>(path, options);
  if (!body.meta) {
    throw new ApiClientError("A szerver érvénytelen választ adott.", null, "MISSING_META");
  }
  return { items: body.data, meta: body.meta };
}

function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

const json = (value: unknown) => JSON.stringify(value);

// ---------- endpoints (plan, chapter 7) ----------

export interface CustomerListParams extends PageParams {
  q?: string;
  status?: CustomerStatus;
  ownerUserId?: Id;
}

export interface DealListParams extends PageParams {
  stage?: DealStage;
  ownerUserId?: Id;
}

export const api = {
  auth: {
    login: (req: LoginRequest) =>
      apiFetch<AuthTokens>("/api/auth/login", { method: "POST", body: json(req) }),
    refresh: (refreshToken: string) =>
      apiFetch<AuthTokens>("/api/auth/refresh", { method: "POST", body: json({ refreshToken }) }),
  },

  users: {
    me: () => apiFetch<User>("/api/users/me"),
  },

  customers: {
    list: (params: CustomerListParams = {}) =>
      apiFetchPage<Customer>(`/api/customers${query({ ...params })}`),
    get: (id: Id) => apiFetch<Customer>(`/api/customers/${id}`),
    create: (input: CustomerInput) =>
      apiFetch<Customer>("/api/customers", { method: "POST", body: json(input) }),
    update: (id: Id, input: CustomerInput) =>
      apiFetch<Customer>(`/api/customers/${id}`, { method: "PUT", body: json(input) }),
    archive: (id: Id) => apiFetch<void>(`/api/customers/${id}`, { method: "DELETE" }),
  },

  deals: {
    list: (params: DealListParams = {}) => apiFetchPage<Deal>(`/api/deals${query({ ...params })}`),
    // GET /api/deals/{id} is missing from the chapter 7 table but /deals/[id] needs it.
    get: (id: Id) => apiFetch<Deal>(`/api/deals/${id}`),
    create: (input: DealInput) =>
      apiFetch<Deal>("/api/deals", { method: "POST", body: json(input) }),
    changeStage: (id: Id, stage: DealStage) =>
      apiFetch<Deal>(`/api/deals/${id}/stage`, { method: "PATCH", body: json({ stage }) }),
  },

  tasks: {
    mine: () => apiFetch<Task[]>("/api/tasks?assignee=me"),
    create: (input: TaskInput) =>
      apiFetch<Task>("/api/tasks", { method: "POST", body: json(input) }),
    complete: (id: Id) => apiFetch<Task>(`/api/tasks/${id}/complete`, { method: "PATCH" }),
  },

  activities: {
    list: (relatedTo: Id, params: PageParams = {}) =>
      apiFetchPage<Activity>(`/api/activities${query({ relatedTo, ...params })}`),
    create: (input: ActivityInput) =>
      apiFetch<Activity>("/api/activities", { method: "POST", body: json(input) }),
  },

  dashboard: {
    summary: () => apiFetch<DashboardSummary>("/api/dashboard/summary"),
  },

  fun: {
    quote: () => apiFetch<FunQuote>("/api/fun/quote"),
  },
};
