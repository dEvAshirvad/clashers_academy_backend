import { Request, Response, NextFunction } from 'express';
import { QuestionServices } from './questions.services';
import Respond from '../../../../lib/Respond';
import APIError from '../../../../errors/APIError';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from "fs"
import { IQuestion } from './questions.modal';
import csvParser from 'csv-parser';

export class QuestionController {
    static async createQuestions(req: Request, res: Response, next: NextFunction) {
        try {
            let questions;

            if (req.file) {
                questions = await QuestionServices.createQuestions(req.file);
            } else if (req.body) {
                questions = await QuestionServices.createQuestions(req.body);
            } else {
                throw new APIError({
                    STATUS: 400,
                    TITLE: "INVALID_FILE",
                    MESSAGE: 'Invalid input. Must provide either a CSV file or an array of questions.'
                })
            }

            return Respond(res, {
                message: 'Questions created successfully',
                data: questions,
            }, 201);
        } catch (error) {
            next(error);
        }
    }


    static async getQuestionById(req: Request, res: Response, next: NextFunction) {
        try {
            const question = await QuestionServices.getQuestionById(req.params.id);
            return Respond(res, {
                message: 'Question fetched successfully',
                data: question,
            }, 200)
        } catch (error) {
            next(error);
        }
    }

    static async updateQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const updatedQuestion = await QuestionServices.updateQuestion(req.params.id, req.body);
            return Respond(res, {
                message: 'Question updated successfully',
                data: updatedQuestion,
            }, 200)
        } catch (error) {
            next(error);
        }
    }

    static async deleteQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const message = await QuestionServices.deleteQuestion(req.params.id);
            return Respond(res, {
                message
            }, 200);
        } catch (error) {
            next(error);
        }
    }

    static async getAllQuestions(req: Request, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 10, difficulty, type } = req.query;
            const filters = { difficulty, type };

            const result = await QuestionServices.getAllQuestions(filters, Number(page), Number(limit));
            return Respond(res, {
                message: 'Question fetched successfully',
                data: result.docs,
                totalDocs: result.totalDocs,
                limit: result.limit,
                totalPages: result.totalPages,
                page: result.page,
                nextPage: result.nextPage,
                prevPage: result.prevPage,
            }, 200)
        } catch (error) {
            next(error);
        }
    }

    static async exportQuestionsToCSV(req: Request, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 10, difficulty, type } = req.query;
            const filters = { difficulty, type };

            const result = await QuestionServices.getAllQuestions(filters, Number(page), Number(limit));
            const questions = result.docs

            const csvWriter = createObjectCsvWriter({
                path: path.join(__dirname, "..", "..", "..", "..", "uploads", 'temp_questions.csv'),
                header: [
                    { id: 'title', title: 'title' },
                    { id: 'description', title: 'description' },
                    { id: 'options', title: 'options' },
                    { id: 'subjects', title: 'subjects' },
                    { id: 'chapters', title: 'chapters' },
                    { id: 'topics', title: 'topics' },
                    { id: 'correctOption', title: 'correctOption' },
                    { id: 'type', title: 'type' },
                    { id: 'difficulty', title: 'difficulty' },
                    { id: 'author', title: 'author' },
                    { id: 'tags', title: 'tags' },
                    { id: 'hints', title: 'hints' },
                    { id: 'points', title: 'points' },
                    { id: 'source', title: 'source' },
                ],
            });

            const records = questions.map(question => ({
                title: question.title,
                description: question.description,
                options: question.options.join('; '),
                subjects: question.subjects.join('; '),
                chapters: question.chapters.join('; '),
                topics: question.topics.join('; '),
                correctOption: question.correctOption.join('; '),
                type: question.type,
                difficulty: question.difficulty,
                author: question.author || '',
                tags: question.tags ? question.tags.join('; ') : '',
                hints: question.hints || '',
                points: question.points || '',
                source: question.source || '',
            }));

            // Write the records to the CSV file
            await csvWriter.writeRecords(records);

            // Set headers for file download
            res.setHeader('Content-Disposition', 'attachment; filename=questions.csv');
            res.setHeader('Content-Type', 'text/csv');

            // Read and send the CSV file
            const fileStream = fs.createReadStream(path.join(__dirname, "..", "..", "..", "..", "uploads", 'temp_questions.csv'))
            fileStream.pipe(res);

            // Clean up the temporary file after sending
            fileStream.on('end', () => {
                fs.unlink(path.join(__dirname, "..", "..", "..", "..", "uploads", 'temp_questions.csv'), (err) => {
                    if (err) {
                        console.error('Error deleting temporary file:', err);
                    }
                });
            });

        } catch (error) {
            next(error);
        }
    };

    static async readCSV(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const results: IQuestion[] = [];
            const filePath = req.file.path;

            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (data: any) => {
                    results.push({
                        title: data.title,
                        description: data.description,
                        options: data.options.split('; '),
                        subjects: data.subjects.split('; '),
                        chapters: data.chapters.split('; '),
                        topics: data.topics.split('; '),
                        correctOption: data.correctOption.split('; '),
                        type: data.type,
                        difficulty: data.difficulty,
                        author: data.author || '',
                        tags: data.tags ? data.tags.split('; ') : [],
                        hints: data.hints || '',
                        points: data.points || '',
                        source: data.source || '',
                    } as IQuestion);
                })
                .on('end', () => {
                    return Respond(res, {
                        message: 'CSV data processed successfully',
                        data: results
                    }, 200);
                })
                .on('error', (error) => {
                    next(error);
                });
        } catch (error) {
            next(error);
        }
    }
}
