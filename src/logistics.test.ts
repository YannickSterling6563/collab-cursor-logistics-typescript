import { nextShipmentState, shipmentEvent } from "./logistics.ts";

const exception = shipmentEvent.parse({ shipmentId: "SHP-42", kind: "exception", occurredAt: "2026-01-10T09:30:00Z", note: "Address needs review" });
if (nextShipmentState(exception) !== "attention") throw new Error("exception events must require attention");
const delivered = shipmentEvent.parse({ shipmentId: "SHP-42", kind: "delivered", occurredAt: "2026-01-10T10:30:00Z", note: "Signed by receiving" });
if (nextShipmentState(delivered) !== "delivered") throw new Error("delivered events must close the shipment");
console.log("logistics decision test passed");
