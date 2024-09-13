import { Types } from "mongoose";
import Question, { IQuestion, partialQuestionValidationSchema, questionValidationSchema } from "./questions.modal";
import { z, ZodError } from "zod";
import fs from "fs"
import csvParser from 'csv-parser';
import APIError from "../../../../errors/APIError";
import { PaginatedResult } from "../../../../types/globals";

export class QuestionServices {
    static async createQuestions(data: Partial<IQuestion>[] | Express.Multer.File): Promise<IQuestion[]> {
        try {
            let questions: Partial<IQuestion>[] = [];

            if (data instanceof Array) {
                questions = data;
            } else if (data.mimetype === 'text/csv') {
                questions = await this.parseCSV(data.path);
            } else {
                throw new APIError({
                    STATUS: 400,
                    TITLE: "INVALID_INPUT",
                    MESSAGE: "Data must be an array of questions or a CSV file."
                });
            }

            const validatedQuestions = await Promise.all(
                questions.map(question => questionValidationSchema.parseAsync(question))
            );

            const insertedQuestions = await Question.insertMany(validatedQuestions) as IQuestion[];

            return insertedQuestions;
        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new APIError({
                    STATUS: 400,
                    TITLE: "VALIDATION_ERROR",
                    MESSAGE: "Validation error in provided data.",
                    ERRORS: error.errors,
                });
            }


            if (error.code === 11000) {
                if (error.writeErrors && error.writeErrors.length > 0) {
                    const duplicateKeys: string[] = [];
                    error.writeErrors.forEach((writeError: any) => {
                        if (writeError.err) {
                            duplicateKeys.push(writeError.err.op.title);
                        }
                    });

                    if (duplicateKeys.length > 0) {
                        throw new APIError({
                            STATUS: 409,
                            TITLE: "DUPLICATE_KEY_ERROR",
                            MESSAGE: `There are some values that already exist.`,
                            ERRORS: duplicateKeys
                        });
                    }
                }
            }


            throw error;
        }
    }

    static parseCSV(filePath: string): Promise<Partial<IQuestion>[]> {
        return new Promise((resolve, reject) => {
            const questions: Partial<IQuestion>[] = [];

            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                    const question: Partial<IQuestion> = {
                        title: row.title,
                        description: row.description,
                        options: row.options ? row.options.split(',') : [],
                        correctOption: row.correctOption ? row.correctOption.split(',') : [],
                        type: row.type,
                        difficulty: row.difficulty,
                        tags: row.tags ? row.tags.split(',') : [],
                    };
                    questions.push(question);
                })
                .on('end', () => resolve(questions))
                .on('error', reject);
        });
    }

    static async getQuestionById(id: string): Promise<IQuestion | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new APIError({ STATUS: 400, TITLE: "INVALID_OBJECTID", MESSAGE: 'Invalid question ID' })
            }
            const question = await Question.findById(id).exec();
            if (!question) {
                throw new APIError({ STATUS: 400, TITLE: "QUESTION_NOT_FOUND", MESSAGE: 'Question not found' })
            }

            return question;
        } catch (error) {
            throw error
        }
    }

    static async updateQuestion(id: string, data: Partial<IQuestion>): Promise<IQuestion | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new APIError({ STATUS: 400, TITLE: "INVALID_OBJECTID", MESSAGE: 'Invalid question ID' })
            }

            const validatedData = partialQuestionValidationSchema.parse(data);

            const updatedQuestion = await Question.findByIdAndUpdate(id, validatedData, { new: true }).exec();
            if (!updatedQuestion) {
                throw new APIError({ STATUS: 400, TITLE: "QUESTION_NOT_FOUND", MESSAGE: 'Question not found' })
            }

            return updatedQuestion;
        } catch (error) {
            if (error instanceof ZodError) {
                throw new APIError({
                    STATUS: 400,
                    TITLE: "VALIDATION_ERROR",
                    MESSAGE: `Validation error in following form`,
                    ERRORS: error.errors
                });
            }
            throw error
        }
    }

    static async deleteQuestion(id: string): Promise<string> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new APIError({ STATUS: 400, TITLE: "INVALID_OBJECTID", MESSAGE: 'Invalid question ID' })
            }

            const question = await Question.findByIdAndDelete(id).exec();
            if (!question) {
                throw new APIError({ STATUS: 400, TITLE: "QUESTION_NOT_FOUND", MESSAGE: 'Question not found' })
            }

            return 'Question deleted successfully';
        } catch (error) {
            throw error
        }
    }

    static async getAllQuestions(
        filters: any = {},
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResult<IQuestion>> {
        try {
            const query: any = {};

            if (filters.difficulty) {
                query.difficulty = filters.difficulty;
            }

            if (filters.type) {
                query.type = filters.type;
            }

            const totalDocs = await Question.countDocuments(query).exec();
            const totalPages = Math.ceil(totalDocs / limit);
            const skip = (page - 1) * limit;

            const docs = await Question.find(query)
                .skip(skip)
                .limit(limit)
                .exec();

            return {
                docs,
                totalDocs,
                limit,
                totalPages,
                page,
                nextPage: page < totalPages,
                prevPage: page > 1,
            };
        } catch (error) {
            throw error
        }
    }
}