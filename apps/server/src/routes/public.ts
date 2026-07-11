import { Router, type NextFunction, type Request, type Response } from "express";
import Assessment from "../models/Assessment.js";
import ResponseModel from "../models/Response.js";
import {
  validateRespondent,
  validateResponseInput,
} from "../utils/assessmentValidation.js";
import type { IAnswer } from "../types/assessment.js";

/**
 * Public, unauthenticated routes for taking a published assessment. Respondents
 * do not log in — they identify themselves with a name + email at submission.
 */
const router = Router();

// GET /api/public/assessments/:id — fetch a published assessment for taking.
// Owner is intentionally omitted from the payload.
router.get("/assessments/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Assessment.findById(req.params.id).lean();
    if (!doc || doc.status !== "published") {
      res.status(404).json({ message: "Assessment not found or not available." });
      return;
    }
    res.json({
      assessment: {
        id: String(doc._id),
        title: doc.title,
        description: doc.description,
        status: doc.status,
        categories: doc.categories,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/public/assessments/:id/responses — submit a response (no auth).
router.post(
  "/assessments/:id/responses",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, answers } = req.body ?? {};

      const respondentCheck = validateRespondent({ name, email });
      if (!respondentCheck.valid) {
        res.status(400).json({ message: respondentCheck.message });
        return;
      }
      const answersCheck = validateResponseInput({ answers });
      if (!answersCheck.valid) {
        res.status(400).json({ message: answersCheck.message });
        return;
      }

      const assessment = await Assessment.findById(req.params.id).lean();
      if (!assessment) {
        res.status(404).json({ message: "Assessment not found." });
        return;
      }
      if (assessment.status !== "published") {
        res.status(400).json({ message: "Assessment is not published." });
        return;
      }

      const doc = await ResponseModel.create({
        assessment: String(req.params.id),
        respondentName: name.trim(),
        respondentEmail: email.trim().toLowerCase(),
        answers: answers as IAnswer[],
        submittedAt: new Date(),
      });

      res.status(201).json({
        response: {
          id: String(doc._id),
          submittedAt: doc.submittedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
