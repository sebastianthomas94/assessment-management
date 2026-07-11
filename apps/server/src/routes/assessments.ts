import { Router, type NextFunction, type Request, type Response } from "express";
import Assessment from "../models/Assessment.js";
import ResponseModel from "../models/Response.js";
import { requireAuth } from "../middleware/auth.js";
import { validateAssessmentInput } from "../utils/assessmentValidation.js";

const router = Router();

// Every route in this router requires an authenticated user.
router.use(requireAuth);

// Count questions across all categories/factors for a lean doc.
function countQuestions(assessment: {
  categories: { factors: { questions: unknown[] }[] }[];
}): number {
  return assessment.categories.reduce(
    (sum, cat) => sum + cat.factors.reduce((fSum, f) => fSum + f.questions.length, 0),
    0
  );
}

// GET /api/assessments — list the current user's assessments.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await Assessment.find({ owner: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      assessments: docs.map((d) => ({
        id: String(d._id),
        title: d.title,
        description: d.description,
        status: d.status,
        totalQuestions: countQuestions(d),
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/categories/library — the owner's saved categories,
// flattened across all their assessments, for the builder's "Load Categories".
// Registered before "/:id" so it isn't captured by the :id param.
router.get(
  "/categories/library",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const docs = await Assessment.find({ owner: req.user!.id })
        .sort({ createdAt: -1 })
        .lean();
      const library = docs.flatMap((d) =>
        d.categories.map((category) => ({
          assessmentId: String(d._id),
          assessmentTitle: d.title,
          category,
        }))
      );
      res.json({ library });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/assessments/:id — single assessment (owner-gated).
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Assessment.findOne({
      _id: req.params.id,
      owner: req.user!.id,
    }).lean();
    if (!doc) {
      res.status(404).json({ message: "Assessment not found." });
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

// POST /api/assessments — create a new assessment from builder data.
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, categories } = req.body ?? {};
    const validation = validateAssessmentInput({ title, categories });
    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const doc = await Assessment.create({
      title: title.trim(),
      description: description?.trim() ?? "",
      categories,
      owner: req.user!.id,
    });
    res.status(201).json({
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

// PUT /api/assessments/:id — update an existing assessment (owner-gated).
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, categories } = req.body ?? {};
    const validation = validateAssessmentInput({ title, categories });
    if (!validation.valid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    const doc = await Assessment.findOneAndUpdate(
      { _id: req.params.id, owner: req.user!.id },
      {
        $set: {
          title: title.trim(),
          description: description?.trim() ?? "",
          categories,
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!doc) {
      res.status(404).json({ message: "Assessment not found." });
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

// DELETE /api/assessments/:id — delete an assessment (owner-gated).
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await Assessment.deleteOne({
      _id: req.params.id,
      owner: req.user!.id,
    });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Assessment not found." });
      return;
    }
    // Also remove any responses tied to the deleted assessment.
    await ResponseModel.deleteMany({ assessment: req.params.id });
    res.json({ message: "Assessment deleted." });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/assessments/:id/status — publish or revert to draft.
router.patch("/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body ?? {};
    if (status !== "draft" && status !== "published") {
      res.status(400).json({ message: "Status must be 'draft' or 'published'." });
      return;
    }
    const doc = await Assessment.findOneAndUpdate(
      { _id: req.params.id, owner: req.user!.id },
      { $set: { status } },
      { new: true }
    ).lean();
    if (!doc) {
      res.status(404).json({ message: "Assessment not found." });
      return;
    }
    res.json({ id: String(doc._id), status: doc.status });
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/:id/responses — list responses for reports (owner-gated).
// Responses are submitted publicly; each carries the respondent's name/email.
router.get(
  "/:id/responses",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assessment = await Assessment.findOne({
        _id: req.params.id,
        owner: req.user!.id,
      }).lean();
      if (!assessment) {
        res.status(404).json({ message: "Assessment not found." });
        return;
      }

      const docs = await ResponseModel.find({ assessment: req.params.id })
        .sort({ submittedAt: -1 })
        .lean();

      res.json({
        responses: docs.map((d) => ({
          id: String(d._id),
          respondent: {
            name: d.respondentName,
            email: d.respondentEmail,
          },
          answers: d.answers,
          submittedAt: d.submittedAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
