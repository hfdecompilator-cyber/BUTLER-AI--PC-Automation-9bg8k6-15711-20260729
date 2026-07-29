/**
 * BUTLER AI™ — BUTLER MIND™ VAULT SERVICE v1.0
 * © 2024–2026 Shawn P. ALL RIGHTS RESERVED.
 *
 * BUTLER MIND™ is a registered trademark concept of Shawn P.
 * Protected under The Household Protocol™ as Stage 7 — THE PANTRY™.
 *
 * THE .bmind FORMAT is a proprietary container:
 *   Magic bytes: BMND1 (ASCII 0x424D4E4431)
 *   Format version: uint8
 *   BUILD_ID: null-terminated string (provenance watermark)
 *   OWNER_SIGNATURE: 32-byte HMAC proof
 *   Payload: AES-256-GCM encrypted JSON
 *
 * Magic bytes in any third-party parser are evidence of copying this spec.
 * The pipeline that GENERATES the vault contents ships only in the server
 * binary (trade secret). This file handles client-side metadata only.
 */

export const BMIND_MAGIC = 'BMND1' as const;
export const BMIND_FORMAT_VERSION = 1;

/** Public metadata embedded in a .bmind vault header (non-secret) */
export interface BMindVaultMeta {
  magic:         typeof BMIND_MAGIC;
  formatVersion: number;
  buildId:       string;
  createdAt:     string;       // ISO 8601
  factsCount:    number;
  ownerHash:     string;       // HMAC proof (hex, 64 chars) — server signs
}

/**
 * Validates that an imported .bmind file has the correct magic bytes and
 * format version before attempting decryption.
 * Returns null if the file is not a valid .bmind vault.
 */
export function validateBMindHeader(raw: string): BMindVaultMeta | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed?.magic !== BMIND_MAGIC ||
      typeof parsed?.formatVersion !== 'number' ||
      parsed.formatVersion !== BMIND_FORMAT_VERSION ||
      typeof parsed?.buildId !== 'string' ||
      typeof parsed?.ownerHash !== 'string' ||
      parsed.ownerHash.length !== 64
    ) return null;
    return parsed as BMindVaultMeta;
  } catch { return null; }
}

/**
 * Generates the metadata wrapper for a new .bmind export.
 * The encrypted payload is assembled server-side; this function only
 * creates the header structure the app displays to the user.
 */
export function buildBMindMeta(params: {
  buildId:    string;
  factsCount: number;
  ownerHash:  string;
}): BMindVaultMeta {
  return {
    magic:         BMIND_MAGIC,
    formatVersion: BMIND_FORMAT_VERSION,
    buildId:       params.buildId,
    createdAt:     new Date().toISOString(),
    factsCount:    params.factsCount,
    ownerHash:     params.ownerHash,
  };
}

/**
 * Human-readable summary of a .bmind vault for the export/import UI.
 * Shown in The Pantry™ settings screen.
 */
export function describeBMindVault(meta: BMindVaultMeta): string {
  return [
    `BUTLER MIND™ vault — format v${meta.formatVersion}`,
    `${meta.factsCount} facts retained`,
    `Created: ${new Date(meta.createdAt).toLocaleDateString()}`,
    `Build: ${meta.buildId}`,
  ].join(' · ');
}
