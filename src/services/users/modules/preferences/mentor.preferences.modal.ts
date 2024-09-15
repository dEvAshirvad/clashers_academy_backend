import { Schema, model, Document } from 'mongoose';

export interface IMentorPreferences extends Document {
    user: string;
    language: string;
    isDeleted: boolean
}

const mentorPreferencesSchema = new Schema<IMentorPreferences>({
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

export const MentorPreferences = model<IMentorPreferences>('tbl_mentor_preferences', mentorPreferencesSchema);