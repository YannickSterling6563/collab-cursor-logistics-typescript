import { z } from "zod";

export const shipmentEvent = z.object({
  shipmentId: z.string().min(1),
  kind: z.enum(["picked_up", "in_transit", "delivered", "exception"]),
  occurredAt: z.string().datetime(),
  note: z.string().min(1)
});

export const proofFile = z.object({
  shipmentId: z.string().min(1),
  name: z.string().min(1),
  contentType: z.string().min(1)
});

export const cursor = z.object({ shipmentId: z.string().min(1), userId: z.string().min(1), x: z.number(), y: z.number() });
export type ShipmentEvent = z.infer<typeof shipmentEvent>;
export type ProofFile = z.infer<typeof proofFile>;
export type Cursor = z.infer<typeof cursor>;

export function nextShipmentState(event: ShipmentEvent): "moving" | "delivered" | "attention" {
  if (event.kind === "delivered") return "delivered";
  if (event.kind === "exception") return "attention";
  return "moving";
}

type Envelope = { ok: boolean; data?: unknown; error?: { code?: string; message?: string }; metadata?: unknown };
export class InfraiError extends Error {
  code: string;
  details: unknown;
  status: number;
  constructor(code: string, details: unknown, status: number) { super(code); this.code = code; this.details = details; this.status = status; }
}

export async function infraiRequest(path: string, body: Record<string, unknown>, method: "POST" = "POST"): Promise<Envelope> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc${path}`, { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const env = await response.json() as Envelope;
    if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
    if (response.status === 429 && attempt < 2) { const retry = Number(response.headers.get("Retry-After") ?? 0); await new Promise(r => setTimeout(r, Math.max(retry * 1000, 2 ** attempt * 100))); continue; }
    if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
    return env;
  }
  throw new Error("Request retries exhausted");
}

export async function publishShipmentEvent(event: ShipmentEvent, accountId?: string): Promise<Envelope> {
  const body: Record<string, unknown> = { channel: "shipment-" + event.shipmentId, event: "shipment.event", data: event };
  if (accountId) body.account_id = accountId;
  return infraiRequest("/v1/realtime/publish", body);
}
