# Browserbase x402 Integration Plan

## Overview

Switch skill execution to use Browserbase's x402 pay-per-use API, so users pay for their own Browserbase sessions when calling skill endpoints.

**Current State:**
- Recording: Uses our Browserbase API key ✅ (keep as-is)
- Execution: Uses our Browserbase API key ❌ (change to x402)

**Target State:**
- Recording: Uses our Browserbase API key ✅ (unchanged)
- Execution: Uses Browserbase x402 API (user pays) ✅ (new)

**Pricing Example:**
- Skill price: $0.01
- Browserbase session (5 min): $0.08
- **Total user pays:** $0.09

---

## Implementation Checklist

### Phase 1: Setup and Configuration

- [ ] **1.1** Add x402 Browserbase configuration to environment variables
  - File: `.env.local`
  - Add: `BROWSERBASE_X402_ENDPOINT=https://x402.browserbase.com`
  - Note: No API key needed for x402 (users pay directly)

- [ ] **1.2** Install x402 package if not already installed
  - Run: `pnpm add x402`
  - Verify: Check `package.json` has `x402` dependency

- [ ] **1.3** Define Browserbase session pricing constants
  - File: Create `/lib/browserbase/pricing.ts`
  - Add constants:
    - `DEFAULT_SESSION_MINUTES = 5`
    - `BROWSERBASE_RATE_PER_HOUR = 1.00` (USDC)
    - `calculateSessionCost(minutes: number)` helper

---

### Phase 2: Update Payment Requirements Calculation

- [ ] **2.1** Read current payment requirements logic
  - File: `/lib/payment-verification.ts`
  - Function: `createPaymentRequirements()`
  - Understand: How we currently calculate skill price

- [ ] **2.2** Create dual payment requirements function
  - File: `/lib/payment-verification.ts`
  - New function: `createDualPaymentRequirements(skillPrice: number, sessionMinutes: number)`
  - Returns: Array of 2 payment requirements:
    1. Skill payment (to creator address)
    2. Browserbase session payment (to x402.browserbase.com)

- [ ] **2.3** Update 402 response to include both payments
  - File: `/app/api/skills/[skillId]/execute/route.ts`
  - Line: ~108 (where `create402Response` is called)
  - Change: Pass both skill price and Browserbase session cost
  - Result: Client sees 2 payment requirements instead of 1

---

### Phase 3: Update Frontend to Handle Dual Payments

- [ ] **3.1** Update SkillTester to display total cost
  - File: `/components/SkillTester.tsx`
  - Current: Shows skill price only (`$0.01`)
  - New: Shows total cost (`$0.09 (Skill: $0.01 + Session: $0.08)`)
  - Update all price displays (button text, prompts, etc.)

- [ ] **3.2** Update skill page to display breakdown
  - File: `/app/skills/[skillId]/page.tsx`
  - Price metric card: Add note about Browserbase session cost
  - Example: "Price: $0.01 + ~$0.08 session (5 min)"
  - Update `formatPrice()` calls to show breakdown

- [ ] **3.3** Test x402-fetch with dual payments
  - File: `/components/SkillTester.tsx`
  - Verify: `wrapFetchWithPayment()` handles array of payment requirements
  - Note: x402-fetch should automatically handle multiple payments
  - Test: Make a test execution and check both payments are sent

---

### Phase 4: Create Browserbase x402 Client

- [ ] **4.1** Create Browserbase x402 service file
  - File: Create `/lib/browserbase/x402-client.ts`
  - Purpose: Wrapper for Browserbase x402 API calls

- [ ] **4.2** Add `createSession()` function
  - Function: `createSession(minutes: number, browserConfig?: object, userAccount: any)`
  - Parameters:
    - `minutes`: Session duration (default: 5)
    - `browserConfig`: Browserbase settings (e.g., `{ advancedStealth: true }`)
    - `userAccount`: User's viem account for payment
  - Returns: `{ sessionId, connectUrl, paidMinutes, expiresAt }`
  - Implementation:
    1. Call `POST /browser/session/create` with payment header
    2. Handle 402 response and create payment
    3. Retry with payment header
    4. Return session details

- [ ] **4.3** Add `terminateSession()` function
  - Function: `terminateSession(sessionId: string)`
  - Purpose: End session early and get refund
  - Implementation:
    1. Call `POST /browser/session/:id/terminate`
    2. Log refund details
    3. Return final usage and refund amount

- [ ] **4.4** Add `getSessionStatus()` function (optional)
  - Function: `getSessionStatus(sessionId: string)`
  - Purpose: Check session usage and remaining time
  - Use case: Monitoring/debugging

---

### Phase 5: Modify Execute Route for Server-Side x402

**IMPORTANT:** The server needs to handle x402 payments on behalf of users, not make them directly.

- [ ] **5.1** Understand user payment flow
  - User sends TWO payment proofs in `X-PAYMENT` header:
    1. Skill payment proof (verified by our server)
    2. Browserbase session payment proof (forwarded to x402.browserbase.com)
  - Our server verifies skill payment, forwards Browserbase payment

- [ ] **5.2** Update execute route to extract both payments
  - File: `/app/api/skills/[skillId]/execute/route.ts`
  - Current: Single `X-PAYMENT` header
  - New: Parse array of payments or multiple headers
  - Extract:
    - `skillPayment`: For skill creator
    - `browserbasePayment`: For x402 Browserbase

- [ ] **5.3** Verify skill payment as before
  - Keep existing: `verifyPayment()` for skill payment
  - Keep existing: `settlePaymentWithRetry()` for skill payment
  - This part stays exactly the same

- [ ] **5.4** Create Browserbase session using user's payment
  - After skill payment verified
  - Call Browserbase x402 API with `browserbasePayment` header
  - Pass user's payment proof to Browserbase
  - Store: `sessionId`, `connectUrl`, `paidMinutes`

---

### Phase 6: Modify Execution Step to Use x402 Session

- [ ] **6.1** Read current Stagehand initialization
  - File: `/workflows/steps/execute-skill-step.ts`
  - Lines: ~220-230 (Stagehand initialization)
  - Current: Uses `BROWSERBASE` env with API key

- [ ] **6.2** Add x402 session parameter to executeSkillStep
  - File: `/workflows/steps/execute-skill-step.ts`
  - Update: `ExecuteSkillInput` type
  - Add field: `browserbaseConnectUrl?: string`
  - Purpose: Pass x402 connect URL from execute route

- [ ] **6.3** Conditionally initialize Stagehand
  - File: `/workflows/steps/execute-skill-step.ts`
  - Lines: ~220-230
  - Logic:
    ```typescript
    const stagehand = new Stagehand({
      env: input.browserbaseConnectUrl ? "LOCAL" : "BROWSERBASE",
      apiKey: input.browserbaseConnectUrl ? undefined : process.env.BROWSERBASE_API_KEY,
      projectId: input.browserbaseConnectUrl ? undefined : process.env.BROWSERBASE_PROJECT_ID,
      // For x402 sessions:
      ...(input.browserbaseConnectUrl && {
        wsEndpoint: input.browserbaseConnectUrl
      })
    });
    ```
  - Recording uses: `env: "BROWSERBASE"` (our API key)
  - Execution uses: `wsEndpoint: connectUrl` (user-paid x402 session)

- [ ] **6.4** Test Stagehand with x402 connect URL
  - Verify: Stagehand can connect to x402 Browserbase session
  - Check: Session ID is accessible via `stagehand.browserbaseSessionID`
  - Note: May need to use different property for x402 sessions

---

### Phase 7: Add Session Termination

- [ ] **7.1** Store Browserbase session ID in execution context
  - File: `/workflows/steps/execute-skill-step.ts`
  - After Stagehand init, store: `const x402SessionId = input.x402SessionId`
  - Pass through: From execute route → workflow → step

- [ ] **7.2** Call terminate in finally block
  - File: `/workflows/steps/execute-skill-step.ts`
  - Location: After `stagehand.close()` (line ~355)
  - Add:
    ```typescript
    // Terminate x402 session to get refund for unused time
    if (x402SessionId) {
      try {
        const termination = await terminateSession(x402SessionId);
        console.log('[Browserbase x402] Session terminated:', {
          minutesUsed: termination.usage.minutesUsed,
          refund: termination.refund?.amount
        });
      } catch (error) {
        console.error('[Browserbase x402] Failed to terminate:', error);
        // Don't throw - execution already completed
      }
    }
    ```

- [ ] **7.3** Log refund information
  - Add refund details to execution result
  - Field: `browserbaseRefund?: { amount: number, currency: string }`
  - Purpose: Transparency for users

---

### Phase 8: Update Execute Route Flow

- [ ] **8.1** Read current execute route structure
  - File: `/app/api/skills/[skillId]/execute/route.ts`
  - Review: Payment verification flow
  - Review: Workflow execution flow

- [ ] **8.2** Add Browserbase session creation before workflow
  - Location: After `settlePaymentWithRetry()` succeeds (line ~150)
  - Steps:
    1. Extract Browserbase payment from request
    2. Call x402 Browserbase API with user's payment
    3. Get `connectUrl` and `sessionId`
    4. Pass to workflow execution

- [ ] **8.3** Update workflow input with session details
  - Modify: `ExecuteSkillInput` object (line ~153)
  - Add fields:
    ```typescript
    const input: ExecuteSkillInput = {
      skillId,
      variables,
      executorAddress: session.isAuthenticated ? session.evmAddress : null,
      browserbaseConnectUrl: x402Session.connectUrl,  // New
      x402SessionId: x402Session.sessionId,            // New
    };
    ```

- [ ] **8.4** Update response to include Browserbase cost
  - File: `/app/api/skills/[skillId]/execute/route.ts`
  - Line: ~184 (return statement)
  - Add:
    ```typescript
    return NextResponse.json({
      ...result,
      payment: {
        skillPayment: {
          txHash: settlementResult.txHash,
          settled: settlementResult.success,
          amount: skillPrice
        },
        browserbaseSession: {
          sessionId: x402Session.sessionId,
          minutesPaid: x402Session.paidMinutes,
          cost: calculateSessionCost(5)
        }
      },
    });
    ```

---

### Phase 9: Update Types

- [ ] **9.1** Update ExecuteSkillInput type
  - File: `/lib/types/skills.ts`
  - Add fields:
    ```typescript
    export interface ExecuteSkillInput {
      skillId: string;
      variables?: Record<string, any>;
      executorAddress?: string | null;
      browserbaseConnectUrl?: string;  // New
      x402SessionId?: string;           // New
    }
    ```

- [ ] **9.2** Update ExecuteSkillOutput type (optional)
  - File: `/lib/types/skills.ts`
  - Add field:
    ```typescript
    export interface ExecuteSkillOutput {
      // ... existing fields ...
      browserbaseRefund?: {
        amount: number;
        currency: string;
        minutesUsed: number;
        minutesPaid: number;
      };
    }
    ```

- [ ] **9.3** Create Browserbase x402 types
  - File: Create `/lib/types/browserbase-x402.ts`
  - Add:
    ```typescript
    export interface BrowserbaseSession {
      sessionId: string;
      connectUrl: string;
      paidMinutes: number;
      expiresAt: string;
      pricing: {
        ratePerHour: number;
        amountPaid: number;
        currency: string;
      };
    }

    export interface SessionTermination {
      sessionId: string;
      finalStatus: string;
      usage: {
        minutesPaid: number;
        minutesUsed: number;
      };
      refund?: {
        eligible: boolean;
        amount: number;
        currency: string;
      };
    }
    ```

---

### Phase 10: Error Handling

- [ ] **10.1** Handle Browserbase session creation failure
  - File: `/app/api/skills/[skillId]/execute/route.ts`
  - Scenario: User paid skill but Browserbase x402 fails
  - Action: Return 500 error with helpful message
  - Note: Skill payment already settled (can't refund automatically)

- [ ] **10.2** Handle session timeout during execution
  - File: `/workflows/steps/execute-skill-step.ts`
  - Scenario: Execution takes > 5 minutes
  - Action: Catch Browserbase disconnection error
  - Log: "Session expired, consider increasing estimatedMinutes"

- [ ] **10.3** Handle terminate failure
  - File: `/workflows/steps/execute-skill-step.ts`
  - Scenario: Execution succeeds but terminate fails
  - Action: Log error but return success
  - Note: User won't get refund but execution worked

---

### Phase 11: Testing

- [ ] **11.1** Test recording flow unchanged
  - Action: Record a new skill
  - Verify: Uses regular Browserbase (our API key)
  - Verify: No x402 payment required
  - Expected: Works exactly as before

- [ ] **11.2** Test execution with x402 payment
  - Action: Execute existing skill via SkillTester
  - Verify: Client sends TWO payment proofs
  - Verify: Server creates x402 Browserbase session
  - Verify: Execution uses x402 session
  - Expected: Skill executes successfully

- [ ] **11.3** Test session termination and refund
  - Action: Execute skill that takes ~1 minute
  - Verify: Session created for 5 minutes ($0.08)
  - Verify: Terminate called after execution
  - Verify: Refund shows ~4 minutes unused (~$0.064)
  - Expected: Refund logged in response

- [ ] **11.4** Test total cost calculation
  - Action: Check skill page price display
  - Expected: Shows "$0.01 + ~$0.08 session"
  - Action: Execute skill
  - Expected: User pays $0.09 total

- [ ] **11.5** Test execution timeout scenario
  - Action: Create skill with long-running task
  - Set: Default 5 minutes
  - Verify: If execution exceeds 5 min, Browserbase disconnects
  - Expected: Graceful error message

- [ ] **11.6** Test multiple concurrent executions
  - Action: Execute same skill 3 times in parallel
  - Verify: Each creates separate x402 session
  - Verify: No session ID conflicts
  - Expected: All 3 succeed independently

---

### Phase 12: Documentation

- [ ] **12.1** Update API documentation
  - File: `/app/api/skills/[skillId]/execute/route.ts`
  - Update comments to mention:
    - Two payments required (skill + Browserbase)
    - Default session duration: 5 minutes
    - Refunds for unused time

- [ ] **12.2** Add user-facing pricing note
  - File: `/app/skills/[skillId]/page.tsx`
  - Add tooltip or info icon
  - Text: "Includes ~$0.08 for 5-min Browserbase session. Unused time is refunded."

- [ ] **12.3** Create troubleshooting guide
  - File: Create `/docs/BROWSERBASE_X402_TROUBLESHOOTING.md`
  - Include:
    - "Session expired" → Execution took >5 min, increase duration
    - "Payment failed" → Check USDC balance on Base
    - "No refund received" → Server must call /terminate explicitly

---

### Phase 13: Optimization (Optional - Future)

- [ ] **13.1** Dynamic session duration based on skill history
  - Analyze: Average execution time per skill
  - Set: `estimatedMinutes = avgTime * 1.5` (50% buffer)
  - Example: Skill averages 2 min → request 3 min session

- [ ] **13.2** Add session extension support
  - If execution detects < 1 minute remaining
  - Automatically extend session by 5 more minutes
  - Note: Requires additional x402 payment from user

- [ ] **13.3** Cache session cost calculation
  - Store: Browserbase pricing in database
  - Update: Daily via cron job
  - Benefit: Faster cost calculations

---

## Implementation Order

**Week 1: Backend Foundation**
- Phase 1: Setup (tasks 1.1-1.3)
- Phase 2: Payment requirements (tasks 2.1-2.3)
- Phase 4: x402 client (tasks 4.1-4.4)
- Phase 9: Types (tasks 9.1-9.3)

**Week 2: Execution Flow**
- Phase 5: Execute route updates (tasks 5.1-5.4)
- Phase 6: Stagehand x402 integration (tasks 6.1-6.4)
- Phase 7: Session termination (tasks 7.1-7.3)
- Phase 8: Complete execute route (tasks 8.1-8.4)

**Week 3: Frontend & Testing**
- Phase 3: Frontend updates (tasks 3.1-3.3)
- Phase 10: Error handling (tasks 10.1-10.3)
- Phase 11: Testing (tasks 11.1-11.6)
- Phase 12: Documentation (tasks 12.1-12.3)

**Future: Optimizations**
- Phase 13: Optional improvements (as needed)

---

## Key Files Modified

### Backend
- `/app/api/skills/[skillId]/execute/route.ts` - Execute endpoint
- `/workflows/steps/execute-skill-step.ts` - Stagehand execution
- `/lib/payment-verification.ts` - Dual payment requirements
- `/lib/browserbase/x402-client.ts` - New file
- `/lib/browserbase/pricing.ts` - New file
- `/lib/types/skills.ts` - Updated types
- `/lib/types/browserbase-x402.ts` - New file

### Frontend
- `/components/SkillTester.tsx` - Total cost display
- `/app/skills/[skillId]/page.tsx` - Price breakdown

### Config
- `.env.local` - x402 endpoint
- `package.json` - x402 dependency

---

## Important Notes

### Recording vs Execution
- **Recording** = Use our Browserbase API key (free for us, we pay)
- **Execution** = Use x402 Browserbase (user pays per session)

### Payment Flow
1. User requests execution
2. Server returns 402 with TWO payment requirements:
   - Skill payment ($0.01 to creator)
   - Browserbase payment ($0.08 to x402.browserbase.com)
3. Client (x402-fetch) handles both payments automatically
4. Server verifies skill payment, forwards Browserbase payment
5. Execution proceeds with x402 session

### Refund Mechanism
- **Must call `/terminate`** to get refund
- If session expires naturally → no refund
- Refund = (minutesPaid - minutesUsed) * $0.016/min
- Example: 5 min paid, 1 min used → refund $0.064

### Session Duration
- Default: 5 minutes ($0.08)
- Most skills: < 1 minute execution time
- 5 minutes provides safety buffer
- Unused time refunded via terminate

### Cost Breakdown
- Skill price: Set by creator (e.g., $0.01)
- Browserbase: $1/hour = $0.016/min
- 5 min session: $0.08
- **Total**: $0.01 + $0.08 = $0.09

---

## Success Criteria

✅ Recording flow unchanged (uses our API key)
✅ Execution uses x402 Browserbase (user pays)
✅ Users see total cost breakdown before executing
✅ Refunds issued for unused session time
✅ All tests pass
✅ No regression in execution success rate
