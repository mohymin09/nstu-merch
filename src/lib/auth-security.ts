import crypto from "crypto";

/**
 * Hash password securely using Node.js crypto.scrypt
 * Output format: salt:hash (hex encoded)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Timing-safe password verification
 */
export function verifyPassword(password: string, storedHashOrPlain: string): boolean {
  if (!storedHashOrPlain || !password) return false;

  // Stored as salt:hash
  if (storedHashOrPlain.includes(":")) {
    const [salt, originalHash] = storedHashOrPlain.split(":");
    if (!salt || !originalHash) return false;

    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    const hashBuf = Buffer.from(hash, "hex");
    const origBuf = Buffer.from(originalHash, "hex");

    if (hashBuf.length !== origBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, origBuf);
  }

  // Fallback constant-time check for legacy plain values during migration
  const passBuf = Buffer.from(password);
  const storedBuf = Buffer.from(storedHashOrPlain);
  if (passBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(passBuf, storedBuf);
}

/**
 * Validate password according to the security policy:
 * - Minimum 12 characters
 * - Allow long passphrases (up to 128 characters)
 * - Must contain at least one uppercase, one lowercase, and one number or symbol
 */
export function validatePasswordPolicy(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || password.length < 12) {
    errors.push("Password must be at least 12 characters long.");
  }
  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }
  if (!/[0-9]/.test(password) && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push("Password must contain at least one number (0-9) or symbol.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a cryptographically secure random recovery token
 */
export function generateSecureToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

/**
 * Hash a token with SHA-256 for secure database lookup
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Extract trusted server session from cookies in Request
 */
export function getSessionFromCookie(req: Request): { userId: string; role: string } | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/nstu_session=([^;]+)/);
  if (!match) return null;

  try {
    const rawVal = decodeURIComponent(match[1]);
    const session = JSON.parse(rawVal);
    if (session && session.userId && session.role) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}
