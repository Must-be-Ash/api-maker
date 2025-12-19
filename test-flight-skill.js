// Test flight skill with X402 payment
import { wrapFetchWithPayment } from 'x402-fetch';
import { createWalletClient, http, publicActions } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

// Load .env.local explicitly
dotenv.config({ path: '.env.local' });

async function testFlightSkill() {
  const skillId = 'skill_1766088255171_j3hhjht74';
  const apiUrl = `http://localhost:3000/api/skills/${skillId}/execute`;

  const variables = {
    '%origin%': 'Toronto',
    '%destination%': 'Los Angeles',
    '%departure_date%': '2025-12-20',
    '%return_date%': '2025-12-25'
  };

  console.log('[Test] Testing flight skill:', skillId);
  console.log('[Test] Variables:', variables);

  // Step 1: Create wallet from private key
  const privateKey = process.env.X402_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error('[Test] X402_WALLET_PRIVATE_KEY not found in environment');
    return;
  }

  console.log('[Test] Creating wallet account...');
  const account = privateKeyToAccount(privateKey);
  console.log('[Test] Wallet address:', account.address);

  // Step 2: Create viem wallet client
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org'),
  }).extend(publicActions);
  console.log('[Test] Created wallet client on Base network');

  // Step 3: Wrap fetch with x402 payment capability
  // Max payment amount in atomic units (USDC has 6 decimals, $0.01 = 10000)
  const maxPaymentAmount = BigInt(10000); // $0.01 in USDC atomic units
  const fetchFunc = wrapFetchWithPayment(
    fetch,
    walletClient,
    maxPaymentAmount
  );
  console.log('[Test] Wrapped fetch with payment capability, max amount:', maxPaymentAmount.toString());

  try {
    // Step 4: Make API call (x402-fetch handles the 402 flow automatically)
    console.log('\n[Test] Executing skill with payment...');
    const response = await fetchFunc(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ variables }),
    });

    console.log('[Test] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Test] Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('\n[Test] ✅ Success! Result:', JSON.stringify(result, null, 2));

    if (result.payment?.txHash) {
      console.log('[Test] Payment settled with tx:', result.payment.txHash);
    }

  } catch (error) {
    console.error('[Test] Error:', error);
  }
}

testFlightSkill().catch(console.error);
