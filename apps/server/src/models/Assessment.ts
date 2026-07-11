import { model, type Document, Schema, Types } from "mongoose";
import {
  QUESTION_TYPES,
  type AssessmentStatus,
  type ICategory,
  type IFactor,
  type IQuestion,
} from "../types/assessment.js";

/**
 * Embedded question subdocument. `options` is optional (only meaningful for
 * multiple_choice questions); its ≥2-option rule is enforced at the
 * application-validation layer (`validateAssessmentInput`).
 */
const questionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: QUESTION_TYPES },
    required: { type: Boolean, default: true },
    options: { type: [String] },
    scaleMax: { type: Number, default: 5, min: 2, max: 10 },
    // Optional answer key (validated at the application layer). Absent =
    // informational (not scored). open_text has no correct-answer field.
    correctOption: { type: String },
    correctRating: { type: Number, min: 1 },
    correctBoolean: { type: Boolean },
  },
  { _id: false }
);

const factorSchema = new Schema<IFactor>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: "help_center" },
    questions: { type: [questionSchema], default: [] },
  },
  { _id: false }
);

const categorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    factors: { type: [factorSchema], default: [] },
  },
  { _id: false }
);

/**
 * Mongoose document interface. `owner` is an ObjectId ref here (the domain
 * `IAssessment` in `types/assessment.ts` keeps it as `string` for the API
 * layer; route handlers cast via `String()`).
 */
export interface IAssessmentDoc extends Document {
  title: string;
  description: string;
  status: AssessmentStatus;
  owner: Types.ObjectId;
  categories: ICategory[];
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessmentDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categories: { type: [categorySchema], default: [] },
  },
  { timestamps: true }
);

const Assessment = model<IAssessmentDoc>("Assessment", assessmentSchema);
export default Assessment;
