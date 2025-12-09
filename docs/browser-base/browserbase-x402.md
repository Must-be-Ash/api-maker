# x402 Browserbase API

Pay-per-use browser sessions with crypto. No API keys, no accounts—just pay and connect.

**Endpoint**: `https://x402.browserbase.com`

## Quick Start

```bash
# Install dependencies
npm install viem x402

# Create a session (requires USDC on Base)
PRIVATE_KEY=0x... npx tsx scripts/test-with-wallet.ts
```

## How It Works

1. **Request** → Server returns payment requirements (402 response)
2. **Sign** → Your wallet signs a USDC authorization
3. **Pay & Connect** → Send signed payment, receive browser WebSocket URL

## Endpoints

### Create Session

Creates a new browser session with prepaid time.

**POST** `/browser/session/create`

**Request Body:**

```json
{
  "estimatedMinutes": 30,
  "browserConfig": {
    "advancedStealth": true
  }
}
```

**First Response (402 Payment Required):**

```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "maxAmountRequired": "500000",
    "payTo": "0x...",
    "resource": "https://x402.browserbase.com/browser/session/create"
  }]
}
```

**With Payment (200 OK):**

```json
{
  "sessionId": "abc-123",
  "connectUrl": "wss://connect.browserbase.com/...",
  "paidMinutes": 30,
  "expiresAt": "2025-12-03T18:00:00Z",
  "pricing": {
    "ratePerHour": 1.00,
    "amountPaid": 0.50,
    "currency": "USDC"
  }
}
```

### Get Session Status

**GET** `/browser/session/:id/status`

**Response:**

```json
{
  "sessionId": "abc-123",
  "status": "active",
  "usage": {
    "minutesPaid": 30,
    "minutesUsed": 5,
    "minutesRemaining": 25
  },
  "expiresAt": "2025-12-03T18:00:00Z"
}
```

### Extend Session

Add more time to an active session.

**POST** `/browser/session/:id/extend`

**Request Body:**

```json
{
  "additionalMinutes": 15
}
```

**Response:** Same as create (requires x402 payment)

### Terminate Session

End a session early. Unused time may be refunded.

**POST** `/browser/session/:id/terminate`

**Response:**

```json
{
  "sessionId": "abc-123",
  "finalStatus": "terminated",
  "usage": {
    "minutesPaid": 30,
    "minutesUsed": 10
  },
  "refund": {
    "eligible": true,
    "amount": 0.33,
    "currency": "USDC"
  }
}
```

## Making x402 Payments

### Using the x402 Package (Recommended)

```typescript
import { privateKeyToAccount } from "viem/accounts";
import { getAddress } from "viem";
import { exact } from "x402/schemes";

const account = privateKeyToAccount("0x...");

// 1. Get payment requirements
const res = await fetch("https://x402.browserbase.com/browser/session/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ estimatedMinutes: 30 }),
});

const { accepts } = await res.json();
const req = accepts[0];

// 2. Create payment header
const paymentHeader = await exact.evm.createPaymentHeader(account, 1, {
  scheme: req.scheme,
  network: req.network,
  maxAmountRequired: req.maxAmountRequired,
  resource: req.resource,
  description: req.description,
  mimeType: req.mimeType,
  payTo: getAddress(req.payTo),
  maxTimeoutSeconds: req.maxTimeoutSeconds,
  asset: getAddress(req.asset),
  extra: req.extra,
});

// 3. Send with payment
const session = await fetch("https://x402.browserbase.com/browser/session/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-PAYMENT": paymentHeader,
  },
  body: JSON.stringify({ estimatedMinutes: 30 }),
}).then(r => r.json());

console.log(session.connectUrl); // wss://connect.browserbase.com/...
```

### Using x402-fetch (Automatic)

```typescript
import { wrapFetch } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount("0x...");
const x402Fetch = wrapFetch(fetch, account);

// Payments are handled automatically
const session = await x402Fetch("https://x402.browserbase.com/browser/session/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ estimatedMinutes: 30 }),
}).then(r => r.json());
```

## Pricing

| Duration | Cost (USDC) |
|----------|-------------|
| 5 min    | $0.08       |
| 15 min   | $0.25       |
| 30 min   | $0.50       |
| 60 min   | $1.00       |

**Rate:** $1.00/hour

## Requirements

- **Network:** Base (mainnet)
- **Token:** USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Wallet:** Any EVM wallet with USDC on Base

## Using Your Session

Once you have a `connectUrl`, connect with Playwright or Puppeteer:

```typescript
import { chromium } from "playwright";

const browser = await chromium.connectOverCDP(session.connectUrl);
const page = browser.contexts()[0].pages()[0];

await page.goto("https://example.com");
await page.screenshot({ path: "screenshot.png" });

await browser.close();
```

## Links

- **x402 Protocol:** [x402.org](https://x402.org)
- **Browserbase:** [browserbase.com](https://browserbase.com)
- **Get USDC on Base:** [Uniswap](https://app.uniswap.org)
