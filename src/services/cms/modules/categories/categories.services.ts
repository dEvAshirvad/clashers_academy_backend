import Category, { CategoryType, ICategories, categoryLoader, categoryValidationSchema } from "./categories.modal";
import { z, ZodError } from "zod";
import APIError from "../../../../errors/APIError";
import { Types } from "mongoose";
import { PaginatedResult } from "../../../../types/globals";
import fs from "fs"
import csvParser from "csv-parser";

interface CategoryFilter {
    type: CategoryType
}

export class CategoryService {
    static async createCategories(data: Partial<ICategories>[] | Partial<ICategories>): Promise<ICategories[]> {
        try {
            const categories = Array.isArray(data) ? data : [data];

            const validatedCategories = await Promise.all(
                categories.map(category => categoryValidationSchema.parseAsync(category))
            );

            const insertedCategories = await Category.insertMany(validatedCategories, { ordered: false });

            return insertedCategories;
        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new APIError({
                    STATUS: 400,
                    TITLE: "VALIDATION_ERROR",
                    MESSAGE: `Validation error in provided data`,
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

    static async parseCSV(filePath: string): Promise<Partial<ICategories>[]> {
        return new Promise((resolve, reject) => {
            const categories: Partial<ICategories>[] = [];

            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                    const category: Partial<ICategories> = {
                        title: row.title,
                        parent: row?.parent,
                        type: row.type
                    };
                    categories.push(category);
                })
                .on('end', () => resolve(categories))
                .on('error', reject);
        });
    }

    static async getCategoryById(id: string): Promise<ICategories | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new APIError({ STATUS: 400, TITLE: "INVALID_OBJECTID", MESSAGE: 'Invalid category ID' });
            }

            const category = await Category.findById(id).exec();
            if (!category) {
                throw new APIError({ STATUS: 404, TITLE: "CATEGORY_NOT_FOUND", MESSAGE: 'Category not found' });
            }

            return category;
        } catch (error) {
            throw error;
        }
    }

    static async getAllCategories(
        filters: Partial<CategoryFilter>,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResult<ICategories>> {
        try {
            const query: Partial<CategoryFilter> = {};
            if (filters.type) {
                query.type = filters.type;
            }

            const totalDocs = await Category.countDocuments(query).exec();
            const totalPages = Math.ceil(totalDocs / limit);
            const skip = (page - 1) * limit;

            const docs = await Category.find(query)
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

    static async updateCategory(id: string, data: Partial<ICategories>): Promise<ICategories | null> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new APIError({ STATUS: 400, TITLE: "INVALID_OBJECTID", MESSAGE: 'Invalid category ID' });
            }
            const validatedData = categoryValidationSchema.partial().parse(data);

            const updatedCategory = await Category.findByIdAndUpdate(id, validatedData, { new: true }).exec();
            if (!updatedCategory) {
                throw new APIError({ STATUS: 404, TITLE: "CATEGORY_NOT_FOUND", MESSAGE: 'Category not found' });
            }

            return updatedCategory;
        } catch (error) {
            if (error instanceof ZodError) {
                throw new APIError({
                    STATUS: 400,
                    TITLE: "VALIDATION_ERROR",
                    MESSAGE: `Validation Error: ${error.errors.map(err => `${err.path}: ${err.message}`).join(',\n')}`
                });
            }
            throw error;
        }
    }

    static async deleteCategory(id: string): Promise<string> {
        try {
            if (!Types.ObjectId.isValid(id)) {
                throw new APIError({ STATUS: 400, TITLE: "INVALID_OBJECTID", MESSAGE: 'Invalid category ID' });
            }

            const category = await Category.findByIdAndDelete(id).exec();
            if (!category) {
                throw new APIError({ STATUS: 404, TITLE: "CATEGORY_NOT_FOUND", MESSAGE: 'Category not found' });
            }

            return 'Category deleted successfully';
        } catch (error) {
            throw error;
        }
    }

    // static async verifyCategoryByTitles(titles: string[]): Promise<Record<string, boolean>> {
    //     try {
    //         // Validate the input array of titles using Zod
    //         z.array(z.string().min(1)).parse(titles);

    //         // Use DataLoader to batch the requests for all titles
    //         const resultsArray = await categoryLoader.loadMany(titles);

    //         // Convert the resultsArray to a record (map of title to boolean)
    //         const results: Record<string, boolean> = {};
    //         titles.forEach((title, index) => {
    //             // If the category exists (i.e., not null), mark it as true, else false
    //             results[title] = resultsArray[index] !== null;
    //         });

    //         return results;
    //     } catch (error) {
    //         // Handle validation errors
    //         if (error instanceof ZodError) {
    //             throw new APIError({
    //                 STATUS: 400,
    //                 TITLE: "VALIDATION_ERROR",
    //                 MESSAGE: `Validation error in provided data`,
    //                 ERRORS: error.errors
    //             });
    //         }
    //         // Re-throw any other errors
    //         throw error;
    //     }
    // }

    static async verifyCategoriesExist(type: CategoryType, titles?: string[]) {
        if (!titles) {
            return false
        }
        const formattedTitles = titles.map((element) => {
            return { title: element.toLowerCase().trim(), type }
        })
        const results = await categoryLoader.loadMany(formattedTitles);

        const missingCategories = titles.filter((title, index) => !results[index]);
        if (missingCategories.length > 0) {
            return false
        }

        return true
    };
}
