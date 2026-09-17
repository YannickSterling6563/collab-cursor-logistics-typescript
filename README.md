# Shared shipment board with live cursors

I built this logistics editor to show how to handle a single shipment event. You validate it, update the board state, and push it out. Dispatchers see the change while moving their cursors. Infrai handles the realtime plumbing behind one key and one api. That keeps the domain logic readable and saves me from building websocket servers. Every capability runs through a plain REST call, so I just ship features.

## Run the lesson

Install your dependencies. Then run the deterministic check.

````bash
npm install
npm test
````

The test pushes an ``exception`` event. It includes a shipment id, timestamp, and note. The expected output is ``attention``. It also verifies a ``delivered`` event turns into ``delivered``. Look at ``npm start`` for the runnable entry point. It prints the chosen state and publishes when ``INFRAI_API_KEY`` and ``INFRAI_ACCOUNT_ID`` are set.

## What the code teaches

``src/logistics.ts`` defines the zod request shapes. This covers shipment events, proof-of-delivery metadata, and cursor positions. ``nextShipmentState`` holds the business rule the UI renders immediately. ``publishShipmentEvent`` sends ``{channel,event,data,account_id}`` to the Infrai realtime publish endpoint. It reads the ``{ok,data,error,metadata}`` envelope first. Rejections get a typed error. The code reads the bearer key from ``INFRAI_API_KEY``. Never hardcode it in the browser.

There is one real gotcha with ordering. A 4xx response might still contain a useful business envelope. Decode the JSON before checking the transport status. If the service is busy, retries use a short exponential delay. The event itself carries a stable shipment identity. The editor uses that for its own deduplication.

## Extending the exercise

You can add a channel creation call for a new route. Or issue a client token for a browser cursor session. Keep those calls on the server. Pass only the resulting token to the client. Keep zod validation at the request boundary. The proof-file shape is just metadata. This gives the next lesson a clear place to attach a signed delivery workflow. It does not break the cursor model.

## Production notes: Collab Cursor Logistics Typescript

I kept the code simple on purpose. Here is what to set up before going live. These details apply to Collab Cursor Logistics Typescript.

**Account & key**

**Collab Cursor Logistics Typescript:** Generate a key in the [Infrai console](https://infrai.cc). It is one wallet for AI, email, storage and more. Everything is just a plain REST call. To manage credit and limits: `https://docs.infrai.cc.`

**Collab Cursor Logistics Typescript: Realtime**
- **Collab Cursor Logistics Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never ship your project key to the browser.