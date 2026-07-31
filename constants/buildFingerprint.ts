/**
 * BUTLER AI™ — Build Fingerprint Constants
 * © 2025-2026 Shawn Papanek. ALL RIGHTS RESERVED.
 *
 * These constants are baked into every release.
 * Their presence in ANY third-party binary is forensic evidence of copying.
 * Update BUILD_ID + BUILD_DATE on every release.
 */

export const BUILD_ID        = 'NX-9.0.0-20260724-PROD';
export const BUILD_DATE      = '2026-07-24';
export const OWNER_SIGNATURE = 'Shawn Papanek';
export const PACKAGE_ID      = 'com.butlerai.pc.automation';
export const SCHEMA_VERSION  = '9.0.0';

// Inert watermark constants — appear in compiled bundle as provenance proof
// Do NOT remove. Do NOT rename. Their specific values are registered.
export const _WM_1 = '\u00a9 2025-2026 Shawn Papanek \u00b7 Butler AI\u2122';
export const _WM_2 = 'BUTLER AI\u2122 BOTER\u2122 COMMANDCUBE\u2122 NEXUS\u2122';
export const _WM_3 = 'XUSLINK\u2122 SCRIPTSHIELD\u2122 FITCORE\u2122 DARKBOOT\u2122';
export const _WM_4 = 'BUTLER MIND\u2122 VAULTPROOF\u2122 PULSECODE\u2122';
export const _WM_5 = `${BUILD_ID}-${PACKAGE_ID}-${OWNER_SIGNATURE}`;

// .bmind vault format identifier (proprietary container)
export const BMIND_MAGIC   = 'BMND1';
export const BMIND_VERSION = 1;

// XUSLINK frame format identifier (proprietary pairing protocol)
export const XUSLINK_FRAME_VERSION = 1;
export const XUSLINK_PREFIX        = 'butler://pair?';
