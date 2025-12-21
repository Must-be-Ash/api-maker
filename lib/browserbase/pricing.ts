/**
 * Browserbase x402 Pricing Configuration
 *
 * Defines pricing constants for pay-per-use Browserbase sessions
 */

/**
 * Default session duration in minutes
 * Set to 5 minutes to balance cost and buffer time
 */
export const DEFAULT_SESSION_MINUTES = 5;

/**
 * Browserbase hourly rate in USDC
 * Source: https://x402.browserbase.com pricing
 */
export const BROWSERBASE_RATE_PER_HOUR = 1.00;

/**
 * Calculate the cost of a Browserbase session in USDC
 *
 * @param minutes - Session duration in minutes
 * @returns Cost in USDC (e.g., 0.08 for 5 minutes)
 *
 * @example
 * calculateSessionCost(5)   // 0.08 USDC (5 min * $1/60min)
 * calculateSessionCost(30)  // 0.50 USDC (30 min * $1/60min)
 * calculateSessionCost(60)  // 1.00 USDC (60 min * $1/60min)
 */
export function calculateSessionCost(minutes: number): number {
  if (minutes <= 0 || isNaN(minutes)) {
    throw new Error('Session duration must be a positive number');
  }

  // Cost = (minutes / 60) * hourly rate
  const cost = (minutes / 60) * BROWSERBASE_RATE_PER_HOUR;

  // Round to 6 decimal places to avoid floating point errors
  return Math.round(cost * 1000000) / 1000000;
}

/**
 * Format session cost as USDC string
 *
 * @param minutes - Session duration in minutes
 * @returns Formatted string (e.g., "$0.08")
 *
 * @example
 * formatSessionCost(5)   // "$0.08"
 * formatSessionCost(30)  // "$0.50"
 */
export function formatSessionCost(minutes: number): string {
  const cost = calculateSessionCost(minutes);
  return `$${cost.toFixed(2)}`;
}

/**
 * Calculate total cost including skill price and Browserbase session
 *
 * @param skillPrice - Price set by skill creator in USDC
 * @param sessionMinutes - Session duration in minutes (default: 5)
 * @returns Total cost breakdown
 *
 * @example
 * calculateTotalCost(0.01, 5)
 * // {
 * //   skillPrice: 0.01,
 * //   sessionCost: 0.08,
 * //   total: 0.09
 * // }
 */
export function calculateTotalCost(
  skillPrice: number,
  sessionMinutes: number = DEFAULT_SESSION_MINUTES
): {
  skillPrice: number;
  sessionCost: number;
  total: number;
} {
  const sessionCost = calculateSessionCost(sessionMinutes);
  const total = skillPrice + sessionCost;

  return {
    skillPrice,
    sessionCost,
    total: Math.round(total * 1000000) / 1000000, // Avoid floating point errors
  };
}
