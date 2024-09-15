import { Schema, model, Document } from 'mongoose';

export interface IStudentPreferences extends Document {
    user: string;
    language: string;
    isDeleted: boolean
}

const studentPreferencesSchema = new Schema<IStudentPreferences>({
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

export const StudentPreferences = model<IStudentPreferences>('tbl_student_preferences', studentPreferencesSchema);
