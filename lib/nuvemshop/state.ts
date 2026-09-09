/**
 * OAuth state token (CSRF defense).
 *
 * Format: base64url(`${orgId}.${nonce}.${expMs}`) + "." + hex(HMAC-SHA256).
 * Verified with `crypto.timingSafeEqual`. Signed with INTERNAL_SECRET (already
 * required in env). Tokens expire 10 minutes after issuance.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TTL_MS = 10 * 60 * 1000; // 10 min

function key(): string {
  // Using INTERNAL_SECRET avoids adding yet another env var. If empty (dev with
  // unset secrets) we fall back to a per-process random key — state still works
  // within a single dev process; restart invalidates outstanding flows.
  const secret = process.env.INTERNAL_SECRET || "";
  if (secret.length >= 16) return secret;
  // Memoize per-process fallback.
  if (!fallbackKey) fallbackKey = randomBytes(32).toString("hex");
  return fallbackKey;
}

let fallbackKey: string | null = null;

function b64urlEncode(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

function b64urlDecode(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

export function issueState(
  orgId: string,
  identity?: { userId: string; authSessionId?: string },
): string {
  const nonce = randomBytes(16).toString("hex");
  const exp = Date.now() + TTL_MS;
  const payload = identity
    ? `${orgId}.${identity.userId}.${nonce}.${exp}${identity.authSessionId ? `.${identity.authSessionId}` : ""}`
    : `${orgId}.${nonce}.${exp}`;
  const sig = createHmac("sha256", key()).update(payload, "utf8").digest("hex");
  return `${b64urlEncode(payload)}.${sig}`;
}

export interface VerifiedState {
  orgId: string;
  userId?: string;
  authSessionId?: string;
  nonce: string;
  expMs: number;
}

export function verifyState(token: string | null | undefined): VerifiedState | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, sigHex] = parts;
  if (!encodedPayload || !sigHex) return null;
  let payload: string;
  try {
    payload = b64urlDecode(encodedPayload);
  } catch {
    return null;
  }

  const expectedSig = createHmac("sha256", key()).update(payload, "utf8").digest();
  let receivedSig: Buffer;
  try {
    receivedSig = Buffer.from(sigHex, "hex");
  } catch {
    return null;
  }
  if (receivedSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(receivedSig, expectedSig)) return null;

  const segments = payload.split(".");
  if (segments.length !== 3 && segments.length !== 4 && segments.length !== 5) return null;
  const legacy = segments.length === 3;
  const [orgId, userIdOrNonce, nonceOrExp, expOrSession, authSessionId] = segments;
  const nonce = legacy ? userIdOrNonce : nonceOrExp;
  const expStr = legacy ? nonceOrExp : expOrSession;
  const expMs = Number(expStr);
  if (!orgId || !nonce || !Number.isFinite(expMs)) return null;
  if (Date.now() > expMs) return null;

  return {
    orgId,
    nonce,
    expMs,
    ...(!legacy && userIdOrNonce ? { userId: userIdOrNonce } : {}),
    ...(authSessionId ? { authSessionId } : {}),
  };
}
