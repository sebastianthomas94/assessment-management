import { model, type Document, Schema, Types } from "mongoose";
import { QUESTION_TYPES, type IAnswer } from "../types/assessment.js";

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
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ResponseModel = model<IResponseDoc>("Response", responseSchema);
export default ResponseModel;
