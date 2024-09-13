import { Document, Schema, model } from "mongoose";
import { z } from 'zod';
import getEnumValues from "../../../../lib/getEnumValues";
import { CategoryService } from "../categories/categories.services";
import APIError from "../../../../errors/APIError";
import { CategoryType } from "../categories/categories.modal";

enum QuestionType {
    MCQ = "mcq",
    MSQ = "msq",
    NTQ = "ntq",
}

enum DifficultyLevel {
    S = "S",
    A = "A",
    B = "B",
    C = "C",
    D = "D",
}

export const questionValidationSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    options: z.array(z.string()).nonempty('Options are required'),
    subjects: z.array(z.string()).nonempty('Subjects are required'),
    chapters: z.array(z.string()).nonempty('Chapters are required'),
    topics: z.array(z.string()).nonempty('Topics are required'),
    correctOption: z.array(z.string()).nonempty('At least one correct option is required'),
    type: z.enum(getEnumValues(QuestionType) as [string, ...string[]]),
    difficulty: z.enum(getEnumValues(DifficultyLevel) as [string, ...string[]]),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    hints: z.string().optional(),
    points: z.number().optional(),
    source: z.string().optional(),
}).superRefine(async (data, ctx) => {
    // Combined validation for subjects, chapters, and topics
    try {
        const subjectsExist = await CategoryService.verifyCategoriesExist(CategoryType.SUBJECTS, data.subjects);
        const chaptersExist = await CategoryService.verifyCategoriesExist(CategoryType.CHAPTERS, data.chapters);
        const topicsExist = await CategoryService.verifyCategoriesExist(CategoryType.TOPICS, data.topics);
        const tagsExist = await CategoryService.verifyCategoriesExist(CategoryType.TAGS, data.tags);

        // If any of these return false or throw an error, you can manually add errors to the validation context
        if (!subjectsExist) {
            ctx.addIssue({
                path: ['subjects'],
                message: 'Some subjects do not exist',
                code: "invalid_literal",
                expected: 'existing subjects',
                received: 'non-existing subjects'
            });
        }

        if (!chaptersExist) {
            ctx.addIssue({
                path: ['chapters'],
                message: 'Some chapters do not exist',
                code: "invalid_literal",
                expected: 'existing chapters',
                received: 'non-existing chapters'
            });
        }

        if (!topicsExist) {
            ctx.addIssue({
                path: ['topics'],
                message: 'Some topics do not exist',
                code: "invalid_literal",
                expected: 'existing topics',
                received: 'non-existing topics'
            });
        }

        if (data.tags && !tagsExist) {
            ctx.addIssue({
                path: ['tags'],
                message: 'Some tags do not exist',
                code: "invalid_literal",
                expected: 'existing tags',
                received: 'non-existing tags'
            });
        }
    } catch (error) {
        ctx.addIssue({
            path: ['global'],
            message: 'Error while verifying categories',
            code: "custom"
        });
    }
});

export const partialQuestionValidationSchema = z.object(questionValidationSchema._def.schema.shape).partial();


export interface IQuestion extends Document {
    title: string;
    description: string;
    options: string[];
    correctOption: string[];
    type: QuestionType;
    difficulty: DifficultyLevel;
    subjects: string[];
    chapters: string[];
    topics: string[];
    author: string;
    tags: string[];
    hints?: string;
    points?: number;
    source?: string;
    createdAt: Date;
    updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
    title: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    options: { type: [String], required: true },
    subjects: { type: [String], required: true, trim: true, lowercase: true },
    chapters: { type: [String], required: true, trim: true, lowercase: true },
    topics: { type: [String], required: true, trim: true, lowercase: true },
    correctOption: { type: [String], required: true },
    type: { type: String, enum: Object.values(QuestionType), required: true },
    difficulty: { type: String, enum: Object.values(DifficultyLevel), required: true },
    author: { type: String, default: null },
    tags: { type: [String], default: [], required: true, trim: true, lowercase: true },
    hints: { type: String },
    points: { type: Number, default: 0 },
    source: { type: String },
}, {
    timestamps: true
});

const Question = model<IQuestion>("tbl_questions", QuestionSchema);

export default Question;
