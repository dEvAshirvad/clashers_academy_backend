import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './categories.services';
import Respond from '../../../../lib/Respond';
import APIError from "../../../../errors/APIError";
import { CategoryType, ICategories } from './categories.modal';

export class CategoryController {
    static async createCategory(req: Request, res: Response, next: NextFunction) {
        try {
            let categories: Partial<ICategories>[] = [];

            if (req.body instanceof Array) {
                categories = req.body;
            } else if (req.file && req.file.mimetype === 'text/csv') {
                categories = await CategoryService.parseCSV(req.file.path);
            } else {
                throw new APIError({
                    STATUS: 400,
                    TITLE: "INVALID_INPUT",
                    MESSAGE: "Data must be an array of categories or a CSV file.",
                });
            }

            const insertedCategories = await CategoryService.createCategories(categories);

            return Respond(res, {
                message: 'Categories created successfully',
                data: insertedCategories,
            }, 201);
        } catch (error) {
            next(error);
        }
    }

    static async getCategoryById(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await CategoryService.getCategoryById(req.params.id);
            if (!category) {
                throw new APIError({ STATUS: 404, TITLE: "NOT_FOUND", MESSAGE: 'Category not found' });
            }
            return Respond(res, {
                message: 'Category fetched successfully',
                data: category,
            }, 200);
        } catch (error) {
            next(error);
        }
    }

    static async updateCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const updatedCategory = await CategoryService.updateCategory(req.params.id, req.body);
            if (!updatedCategory) {
                throw new APIError({ STATUS: 404, TITLE: "NOT_FOUND", MESSAGE: 'Category not found' });
            }
            return Respond(res, {
                message: 'Category updated successfully',
                data: updatedCategory,
            }, 200);
        } catch (error) {
            next(error);
        }
    }

    static async deleteCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const message = await CategoryService.deleteCategory(req.params.id);
            return Respond(res, {
                message,
            }, 200);
        } catch (error) {
            next(error);
        }
    }

    static async getAllCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 10, type } = req.query;
            const filters = { type: type as CategoryType };

            const result = await CategoryService.getAllCategories(filters, Number(page), Number(limit));

            return Respond(res, {
                message: 'Categories fetched successfully',
                data: result.docs,
                totalDocs: result.totalDocs,
                limit: result.limit,
                totalPages: result.totalPages,
                page: result.page,
                nextPage: result.nextPage,
                prevPage: result.prevPage,
            }, 200);
        } catch (error) {
            next(error);
        }
    }
}
