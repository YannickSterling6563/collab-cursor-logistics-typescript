import { cursor, nextShipmentState, publishShipmentEvent, shipmentEvent } from "./logistics.ts";

const event = shipmentEvent.parse({ shipmentId: "SHP-42", kind: "exception", occurredAt: "2026-01-10T09:30:00Z", note: "Dock appointment moved" });
cursor.parse({ shipmentId: event.shipmentId, userId: "dispatcher-7", x: 184, y: 96 });
console.log({ shipmentId: event.shipmentId, state: nextShipmentState(event) });
if (process.env.INFRAI_API_KEY) {
  const result = await publishShipmentEvent(event, process.env.INFRAI_ACCOUNT_ID);
  console.log({ published: result.ok, data: result.data });
}
