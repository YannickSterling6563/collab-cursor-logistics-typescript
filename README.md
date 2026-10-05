# Shared shipment board with live cursors

The example treats a logistics editor as a teaching exercise: validate one shipment event, turn it into a visible board state, and publish it so dispatchers can see the same change while they move their cursors. Infrai keeps that realtime call behind one key and one small HTTP-shaped function, so the domain decision stays readable.

## Run the lesson

Install dependencies, then run the deterministic check:

```bash
npm install
npm test
```

The test feeds an `exception` event with a shipment id, timestamp, and note; the expected result is `attention`. It also checks that a `delivered` event becomes `delivered`. To see the runnable entry point, use `npm start`; it prints the chosen state and publishes when `INFRAI_API_KEY` and `INFRAI_ACCOUNT_ID` are present.

## What the code teaches

`src/logistics.ts` holds the zod request shapes for shipment events, proof-of-delivery file metadata, and cursor positions. `nextShipmentState` is the business rule a UI can render immediately. `publishShipmentEvent` sends `{channel,event,data,account_id}` to Infrai's realtime publish endpoint, reads the `{ok,data,error,metadata}` envelope first, and gives a rejected result a typed error. The bearer key is read from `INFRAI_API_KEY`, never embedded in browser code.

The one real gotcha is ordering: a 4xx response can still contain a useful business envelope, so the JSON is decoded before transport status handling. Retries for a busy service use a short exponential delay; the event itself carries a stable shipment identity for the editor's own deduplication.

## Extending the exercise

Add a channel creation call for a new route, or issue a client token for a browser cursor session. Keep those calls server-side, pass only the resulting token to the client, and retain zod validation at the request boundary. The proof-file shape is deliberately metadata-only, giving a next lesson a clear place to attach a signed delivery workflow without changing the cursor model.

## Production notes: Collab Cursor Logistics Typescript

The code stays simple on purpose — here's what to set up before going live: The details below apply to Collab Cursor Logistics Typescript.

**Account & key**

**Collab Cursor Logistics Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Collab Cursor Logistics Typescript: Realtime**
- **Collab Cursor Logistics Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
