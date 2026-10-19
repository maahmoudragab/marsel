// Authentication & 24h Session utilities for MARSEL Studio Admin

export const ADMIN_SESSION_COOKIE = "marsel_admin_session";
export const SESSION_DURATION_SECONDS = 24 * 60 * 60; // 24 hours

function getSecretKey(): string {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || "marsel2026";
}

// Generate an HMAC-SHA256 signature using Web Crypto API (supported in Node & Edge)
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret) as unknown as BufferSource;
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const msgData = encoder.encode(message) as unknown as BufferSource;
  const signature = await crypto.subtle.sign("HMAC", key, msgData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Create a signed 24-hour session token
export async function createSessionToken(): Promise<string> {
  const secret = getSecretKey();
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = `${expiresAt}`;
  const signature = await hmacSha256(payload, secret);
  return `${payload}.${signature}`;
}

// Verify a session token (signature matches and not expired)
export async function verifySessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expiresAt = Number(payload);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false; // Expired
  }

  const secret = getSecretKey();
  const expectedSignature = await hmacSha256(payload, secret);
  return signature === expectedSignature;
}

// Verify admin password
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const secret = getSecretKey();
  return password.trim() === secret.trim();
}

// ------------------------------------------------------------------
// Factory Production Portal Authentication (Simple PIN/Passcode)
// ------------------------------------------------------------------
export const FACTORY_SESSION_COOKIE = "marsel_factory_session";
export const FACTORY_SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days convenience for factory tablet

function getFactorySecretKey(): string {
  return process.env.FACTORY_PASSCODE || "marsel-prod-9821";
}

export function verifyFactoryPasscode(passcode: string): boolean {
  if (!passcode) return false;
  const secret = getFactorySecretKey();
  return passcode.trim() === secret.trim();
}

export async function createFactorySessionToken(): Promise<string> {
  const secret = getFactorySecretKey();
  const expiresAt = Date.now() + FACTORY_SESSION_DURATION_SECONDS * 1000;
  const payload = `factory_${expiresAt}`;
  const signature = await hmacSha256(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyFactorySessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (!payload.startsWith("factory_")) return false;

  const expiresAt = Number(payload.replace("factory_", ""));
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const secret = getFactorySecretKey();
  const expectedSignature = await hmacSha256(payload, secret);
  return signature === expectedSignature;
}