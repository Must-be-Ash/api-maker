/**
 * Checks if the authenticated user owns a skill
 * @param userAddress Verified wallet address from validateSession
 * @param creatorAddress Creator address from database
 * @returns true if user owns the skill
 */
export function checkSkillOwnership(
  userAddress: string,
  creatorAddress: string | null
): boolean {
  // Skills without creatorAddress are "orphaned" (created before auth)
  // User confirmed database will be reset before production, so this shouldn't happen
  // But handling it safely: make orphaned skills uneditable
  if (!creatorAddress) {
    return false; // Nobody can edit orphaned skills
  }

  // Case-insensitive comparison
  return userAddress.toLowerCase() === creatorAddress.toLowerCase();
}

/**
 * Checks if a skill can be claimed by a user
 * Only skills without a creator can be claimed
 * NOTE: Since database will be reset before production, this is for future use
 */
export function canClaimSkill(creatorAddress: string | null): boolean {
  return creatorAddress === null;
}
