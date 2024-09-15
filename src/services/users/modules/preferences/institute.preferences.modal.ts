import { Schema, model, Document } from 'mongoose';

export interface IInstitutePreferences extends Document {
    user: string;
    language: string;
    isDeleted: boolean
}

const institutePreferencesSchema = new Schema<IInstitutePreferences>({
    user: {
        type: String,
        required: true,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    language: {
        type: String,
        default: 'English',
    }
}, {
    timestamps: true
});

export const InstitutePreferences = model<IInstitutePreferences>('tbl_institute_preferences', institutePreferencesSchema);
