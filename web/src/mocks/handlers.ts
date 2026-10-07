// A tiny fake backend: answers api-client requests with the same envelope
// the Spring Boot API will return, so switching to the real API only means
// setting NEXT_PUBLIC_USE_MOCKS=false.

import type { ApiError, Meta } from "@/lib/api-client";
import type { Customer, CustomerInput, DealStage } from "@/lib/types";
import { activities, currentUser, customers, deals, tasks } from "./data";
import { funQuotes } from "./fun-quotes";

const LATENCY_MS = 300;
const HOT_DEAL_IDLE_DAYS = 7;

function respond(status: number, data: unknown, meta: Meta | null = null, error: ApiError | null = null): Response {
  return new Response(JSON.stringify({ data, meta, error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const ok = (data: unknown, meta: Meta | null = null) => respond(200, data, meta);
const notFound = () => respond(404, null, null, { code: "NOT_FOUND", message: "Resource not found" });

function paginate<T>(items: T[], params: URLSearchParams): [T[], Meta] {
  const page = Number(params.get("page") ?? 0);
  const size = Number(params.get("size") ?? 20);
  return [items.slice(page * size, page * size + size), { page, size, totalElements: items.length }];
}

function parseBody<T>(init: RequestInit): T {
  return JSON.parse(typeof init.body === "string" ? init.body : "{}") as T;
}

export async function mockFetch(path: string, init: RequestInit = {}): Promise<Response> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

  const url = new URL(path, "http://mock.local");
  const method = (init.method ?? "GET").toUpperCase();
  const segments = url.pathname.split("/").filter(Boolean).slice(1); // drop "api"
  const [resource, id, action] = segments;
  const params = url.searchParams;

  switch (`${method} ${resource}${id ? "/:id" : ""}${action ? `/${action}` : ""}`) {
    case "POST auth":
    case "POST auth/:id":
      return ok({ accessToken: "mock-access-token", refreshToken: "mock-refresh-token" });

    case "GET users/:id":
      return id === "me" ? ok(currentUser) : notFound();

    case "GET customers": {
      const q = params.get("q")?.toLowerCase();
      const status = params.get("status");
      const filtered = customers.filter(
        (c) => (!q || c.name.toLowerCase().includes(q)) && (!status || c.status === status),
      );
      const [items, meta] = paginate(filtered, params);
      return ok(items, meta);
    }
    case "POST customers": {
      const input = parseBody<CustomerInput>(init);
      if (!input.name || !input.taxNumber) {
        return respond(400, null, null, {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          fieldErrors: {
            ...(!input.name && { name: "Kötelező mező" }),
            ...(!input.taxNumber && { taxNumber: "Kötelező mező" }),
          },
        });
      }
      const now = new Date().toISOString();
      const customer: Customer = {
        contacts: [],
        tags: [],
        ...input,
        id: `c${Date.now()}`,
        ownerUserId: currentUser.id,
        createdAt: now,
        updatedAt: now,
      };
      customers.unshift(customer);
      return respond(201, customer);
    }
    case "GET customers/:id": {
      const customer = customers.find((c) => c.id === id);
      return customer ? ok(customer) : notFound();
    }
    case "PUT customers/:id": {
      const index = customers.findIndex((c) => c.id === id);
      if (index < 0) return notFound();
      customers[index] = { ...customers[index], ...parseBody<CustomerInput>(init), updatedAt: new Date().toISOString() };
      return ok(customers[index]);
    }
    case "DELETE customers/:id": {
      const index = customers.findIndex((c) => c.id === id);
      if (index < 0) return notFound();
      customers.splice(index, 1);
      return new Response(null, { status: 204 });
    }

    case "GET deals": {
      const stage = params.get("stage");
      const [items, meta] = paginate(
        deals.filter((d) => !stage || d.stage === stage),
        params,
      );
      return ok(items, meta);
    }
    case "GET deals/:id": {
      const deal = deals.find((d) => d.id === id);
      return deal ? ok(deal) : notFound();
    }
    case "PATCH deals/:id/stage": {
      const deal = deals.find((d) => d.id === id);
      if (!deal) return notFound();
      const { stage } = parseBody<{ stage: DealStage }>(init);
      const now = new Date().toISOString();
      deal.history.push({ fromStage: deal.stage, toStage: stage, changedAt: now, byUserId: currentUser.id });
      deal.stage = stage;
      deal.lastActivityAt = now;
      return ok(deal);
    }

    case "GET tasks":
      return ok(tasks.filter((t) => t.assigneeUserId === currentUser.id && t.status !== "DONE"));
    case "PATCH tasks/:id/complete": {
      const task = tasks.find((t) => t.id === id);
      if (!task) return notFound();
      task.status = "DONE";
      return ok(task);
    }

    case "GET activities": {
      const relatedTo = params.get("relatedTo");
      const filtered = activities
        .filter((a) => a.relatedTo.id === relatedTo)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const [items, meta] = paginate(filtered, params);
      return ok(items, meta);
    }

    case "GET dashboard/:id": {
      if (id !== "summary") return notFound();
      const open = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
      const stages: DealStage[] = ["NEW", "QUALIFIED", "NEGOTIATION", "WON", "LOST"];
      const hotLimit = Date.now() - HOT_DEAL_IDLE_DAYS * 24 * 60 * 60 * 1000;
      return ok({
        activeCustomers: customers.filter((c) => c.status === "ACTIVE").length,
        openDeals: open.length,
        openTasks: tasks.filter((t) => t.status !== "DONE").length,
        openDealsTotalValue: open.reduce((sum, d) => sum + d.estimatedValue, 0),
        valueByStage: stages.map((stage) => {
          const inStage = deals.filter((d) => d.stage === stage);
          return { stage, count: inStage.length, totalValue: inStage.reduce((s, d) => s + d.estimatedValue, 0) };
        }),
        hotDeals: open.filter((d) => !d.lastActivityAt || Date.parse(d.lastActivityAt) < hotLimit),
      });
    }

    case "GET fun/:id":
      return id === "quote" ? ok(funQuotes[Math.floor(Math.random() * funQuotes.length)]) : notFound();

    default:
      return notFound();
  }
}
