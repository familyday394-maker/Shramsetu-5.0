/**
 * Shram Setu 2.0 — Cryptographic Audit Engine
 * Uses standard Web Crypto SHA-256 digests and canonical serialization to verify
 * work records, payment acknowledgments, and dispute events.
 */

import { AuditEvent, AuditVerificationResult, AuditVerificationOutcome } from '../types';

/**
 * Deterministic canonical serialization (keys sorted alphabetically, nulls preserved, floats normalized)
 */
export function canonicalSerialize(data: Record<string, any>): string {
  if (data === null || typeof data !== 'object') {
    return JSON.stringify(data);
  }

  if (Array.isArray(data)) {
    return '[' + data.map((item) => canonicalSerialize(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(data).sort();
  const entries: string[] = [];

  for (const key of sortedKeys) {
    const val = data[key];
    if (val !== undefined) {
      entries.push(`${JSON.stringify(key)}:${canonicalSerialize(val)}`);
    }
  }

  return '{' + entries.join(',') + '}';
}

/**
 * Computes standard SHA-256 digest in hex using standard Web Crypto API.
 * Works in modern browsers, Node.js 20+, and cloud edge workers.
 */
export async function computeSha256Hex(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Graceful fallback for non-secure contexts (pure JS SHA-256 implementation)
  return fallbackSha256(content);
}

/**
 * Pure JavaScript SHA-256 implementation for environments where crypto.subtle is restricted
 */
function fallbackSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const strLen = ascii.length;
  let i = 0;
  let j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = strLen * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < strLen; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] |= code << ((3 - (i % 4)) * 8);
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    let [a, b, c, d, e, f, g, h] = hash;

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Creates an immutable AuditEvent from an action with cryptographic previousHash linkage.
 */
export async function createAuditEvent(
  entityType: AuditEvent['entityType'],
  entityId: string,
  action: AuditEvent['action'],
  actorRole: AuditEvent['actorRole'],
  actorId: string,
  payloadData: Record<string, any>,
  previousHash: string = GENESIS_HASH,
  sequenceNumber: number = 1
): Promise<AuditEvent> {
  const canonicalPayload = canonicalSerialize(payloadData);
  const timestamp = new Date().toISOString();

  // Digest includes sequence, entity, action, actor, timestamp, payload, and previousHash
  const integrityPayload = canonicalSerialize({
    seq: sequenceNumber,
    type: entityType,
    id: entityId,
    act: action,
    role: actorRole,
    actor: actorId,
    ts: timestamp,
    data: canonicalPayload,
    prev: previousHash,
  });

  const hash = await computeSha256Hex(integrityPayload);

  return {
    id: `AUD-${timestamp.slice(0, 10)}-${sequenceNumber.toString().padStart(4, '0')}`,
    sequenceNumber,
    entityType,
    entityId,
    action,
    actorRole,
    actorId,
    timestamp,
    canonicalPayload,
    previousHash,
    hash,
  };
}

/**
 * Verifies an audit event chain and returns one of the 4 strict outcomes:
 * 1. INTEGRITY_PASSED
 * 2. RECORD_MODIFIED
 * 3. CHAIN_LINKAGE_BROKEN
 * 4. VERIFICATION_INCOMPLETE
 */
export async function verifyAuditChain(chain: AuditEvent[]): Promise<AuditVerificationResult> {
  if (!chain || chain.length === 0) {
    return {
      outcome: 'VERIFICATION_INCOMPLETE',
      totalEventsChecked: 0,
      details: 'Audit history is empty; cannot verify chain completeness.',
    };
  }

  let expectedPreviousHash = GENESIS_HASH;

  for (let idx = 0; idx < chain.length; idx++) {
    const event = chain[idx];

    // Check 1: Format validation
    if (!event.hash || !event.previousHash || typeof event.sequenceNumber !== 'number') {
      return {
        outcome: 'VERIFICATION_INCOMPLETE',
        totalEventsChecked: idx,
        failedEventIndex: idx,
        failedEventId: event.id,
        details: `Event ${event.id || idx} contains invalid or incomplete audit metadata fields.`,
      };
    }

    // Check 2: Predecessor linkage
    if (idx === 0) {
      if (event.previousHash !== GENESIS_HASH) {
        return {
          outcome: 'CHAIN_LINKAGE_BROKEN',
          totalEventsChecked: idx,
          failedEventIndex: idx,
          failedEventId: event.id,
          expectedHash: GENESIS_HASH,
          actualHash: event.previousHash,
          details: `Genesis event ${event.id} does not link to standard zero-hash root. Linkage broken.`,
        };
      }
    } else {
      if (event.previousHash !== expectedPreviousHash) {
        return {
          outcome: 'CHAIN_LINKAGE_BROKEN',
          totalEventsChecked: idx,
          failedEventIndex: idx,
          failedEventId: event.id,
          expectedHash: expectedPreviousHash,
          actualHash: event.previousHash,
          details: `Event ${event.id} (seq #${event.sequenceNumber}) points to previous hash "${event.previousHash.slice(0, 8)}..." instead of predecessor's hash "${expectedPreviousHash.slice(0, 8)}...".`,
        };
      }
    }

    // Check 3: Recompute digest to detect in-place modification
    const integrityPayload = canonicalSerialize({
      seq: event.sequenceNumber,
      type: event.entityType,
      id: event.entityId,
      act: event.action,
      role: event.actorRole,
      actor: event.actorId,
      ts: event.timestamp,
      data: event.canonicalPayload,
      prev: event.previousHash,
    });

    const recomputedHash = await computeSha256Hex(integrityPayload);

    if (recomputedHash !== event.hash) {
      return {
        outcome: 'RECORD_MODIFIED',
        totalEventsChecked: idx + 1,
        failedEventIndex: idx,
        failedEventId: event.id,
        expectedHash: recomputedHash,
        actualHash: event.hash,
        details: `Tamper detected at event ${event.id}! Stored hash "${event.hash.slice(0, 10)}..." does not match recomputed SHA-256 digest "${recomputedHash.slice(0, 10)}...". Content was altered post-signature.`,
      };
    }

    expectedPreviousHash = event.hash;
  }

  return {
    outcome: 'INTEGRITY_PASSED',
    totalEventsChecked: chain.length,
    details: `All ${chain.length} audit trail events verified cryptographically via canonical SHA-256 digests and unbroken predecessor hash linkages.`,
  };
}
