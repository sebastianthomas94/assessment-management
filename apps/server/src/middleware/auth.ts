import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

// Augment Express's Request with the decoded JWT payload so handlers have
// type-safe access to req.user after requireAuth has run.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

/** Middleware that verifies the httpOnly `token` cookie. */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session." });
  }
}

/** Sign a JWT for a user id/email pair. */
export function signToken(payload: { id: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
