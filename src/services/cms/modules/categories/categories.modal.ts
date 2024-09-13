import { Document, model, Schema } from "mongoose";
import { z } from "zod";
import DataLoader, { BatchLoadFn } from 'dataloader';
import getEnumValues from "../../../../lib/getEnumValues";

export enum CategoryType {
    SUBJECTS = "subjects",
    CHAPTERS = "chapters",
    TOPICS = "topics",
    TAGS = "tags",
    OTHERS = "others"
}

// Define a type for the query input
interface CategoryQuery {
    title: string;
    type?: CategoryType; // Optional type field
}

export interface ICategories extends Document {
    title: string;
    type: CategoryType;
    parent?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const categoryValidationSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    parent: z.string().min(1).optional(),
    type: z.enum(getEnumValues(CategoryType) as [string, ...string[]]),
})

const CategorySchema = new Schema<ICategories>({
    title: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    parent: { type: String, trim: true, lowercase: true },
    type: {
        type: String,
        enum: Object.values(CategoryType),
        required: true
    },
}, {
    timestamps: true
});


const Category = model<ICategories>("tbl_categories", CategorySchema);

const batchCategories: BatchLoadFn<CategoryQuery, (Document<unknown, {}, ICategories> & ICategories & Required<{ _id: unknown; }>) | null> = async (keys) => {
    // Extract titles and types from the keys
    const titles = keys.map(key => key.title);
    const types = [...new Set(keys.map(key => key.type))]; // Unique types

    // Find categories by titles and types
    const categories = await Category.find({
        $and: [
            { title: { $in: titles } },
            { type: { $in: types.filter(type => type !== undefined) } }
        ]
    }).exec();

    // Create a map for quick lookup
    const categoryMap = new Map(categories.map(category => [category.title, category]));

    return keys.map(key => categoryMap.get(key.title) || null);
};

export const categoryLoader = new DataLoader(batchCategories);

export default Category;