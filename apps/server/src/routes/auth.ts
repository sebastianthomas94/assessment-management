import { Router, type CookieOptions, type NextFunction, type Request, type Response } from "express";
import User from "../models/User.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { validateAuthInput } from "../utils/validation.js";

const router = Router();

// httpOnly, same-site=lax cookie lives 7 days (must match JWT expiry).
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE,
};

// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body ?? {};
      const validation = validateAuthInput({ email, password, name });
      if (!validation.valid) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const existing = await User.findOne({ email: email.trim().toLowerCase() });
      if (existing) {
        res.status(409).json({ message: "An account with this email already exists." });
        return;
      }

      const user = await User.create({ name: name.trim(), email, password });
      const token = signToken({ id: user.id, email: user.email });
      res.cookie("token", token, cookieOptions);
      res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body ?? {};
      const validation = validateAuthInput({ email, password });
      if (!validation.valid) {
        res.status(400).json({ message: validation.message });
        return;
      }

      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
      }

      const match = await user.comparePassword(password);
      if (!match) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
      }

      const token = signToken({ id: user.id, email: user.email });
      res.cookie("token", token, cookieOptions);
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out." });
});

// GET /api/auth/me — protected route returning the current user.
router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user?.id).select("name email").lean();
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
      res.json({
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
