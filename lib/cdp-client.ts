import { CdpClient } from "@coinbase/cdp-sdk";

// Validate environment variables
if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
  throw new Error('CDP_API_KEY_ID and CDP_API_KEY_SECRET must be set');
}

// Singleton CDP client for server-side authentication
export const cdpClient = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
});
