import { model, type Document, Schema, Types } from "mongoose";
import { QUESTION_TYPES, type IAnswer, type IScore } from "../types/assessment.js";

const scoreSchema = new Schema<IScore>(
  {
    earned: { type: Number, required: true },
    max: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const answerSchema = new Schema<IAnswer>(
  {
    questionId: { type: String, required: true },
    type: { type: String, required: true, enum: QUESTION_TYPES },
    selectedOption: { type: String },
    ratingValue: { type: Number, min: 1 },
    booleanValue: { type: Boolean },
    textValue: { type: String, trim: true },
  },
  { _id: false }
);

export interface IResponseDoc extends Document {
  assessment: Types.ObjectId;
  respondentName: string;
  respondentEmail: string;
  answers: IAnswer[];
  score?: IScore;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const responseSchema = new Schema<IResponseDoc>(
  {
    assessment: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    // Respondents take assessments without an account — captured at submission.
    respondentName: { type: String, required: true, trim: true },
    respondentEmail: { type: String, required: true, trim: true, lowercase: true },
    answers: { type: [answerSchema], required: true },
    // Grading result computed at submission; absent when nothing is gradeable.
    score: { type: scoreSchema },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ResponseModel = model<IResponseDoc>("Response", responseSchema);
export default ResponseModel;
