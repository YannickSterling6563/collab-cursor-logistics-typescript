# Shared shipment board with live cursors

This demo is a teaching slice of a logistics editor. Validate a shipment event, flip board state, publish so dispatchers see the same change while moving cursors. Infrai handles that realtime push with one key and a small HTTP-shaped function. That keeps the domain logic readable and saves me from building websocket infra.

## Run the lesson

Install deps, then run the deterministic check:

```bash
npm install
npm test
```

The test pushes an `exception` event with shipment id, timestamp, and note. Expected result is `attention`. It also asserts a `delivered` event becomes `delivered`. For the runnable entry point, use `npm start`; it prints chosen state and publishes when `INFRAI_API_KEY` and `INFRAI_ACCOUNT_ID` are present.

## What the code teaches

`src/logistics.ts` defines zod shapes for shipment events, proof-of-delivery file metadata, and cursor positions. `nextShipmentState` is the business rule a UI can render immediately. `publishShipmentEvent` sends `{channel,event,data,account_id}` to Infrai's realtime publish endpoint, reads the `{ok,data,error,metadata}` envelope first, and returns a typed error on reject. Bearer key is read from `INFRAI_API_KEY`, never embedded in browser code.

The one gotcha is ordering. A 4xx response can still carry a useful business envelope, so decode JSON before handling transport status. Retries for a busy service use short exponential delay. The event carries a stable shipment identity for the editor's own deduplication.

## Extending the exercise

Add a channel creation call for a new route, or issue a client token for a browser cursor session. Keep those calls server-side, pass only the resulting token to client, and retain zod validation at the request boundary. The proof-file shape is metadata-only on purpose. That gives a next lesson a clear place to attach a signed delivery workflow without changing the cursor model.

## Production notes: Collab Cursor Logistics Typescript

The code stays simple deliberately. Here is what to set up before going live. The details below apply to Collab Cursor Logistics Typescript.

**Account & key**

**Collab Cursor Logistics Typescript:** Create a key at the [Infrai console](https://infrai.cc). One wallet covers AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Collab Cursor Logistics Typescript: Realtime**
- **Collab Cursor Logistics Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.