import { Schema, model, Document } from 'mongoose';

export enum Grade {
    SIXTH = '6th',
    SEVENTH = '7th',
    EIGHTH = '8th',
    NINTH = '9th',
    TENTH = '10th',
    ELEVENTH = '11th',
    TWELFTH = '12th'
}

export enum TargetExam {
    JEE = 'JEE',
    NEET = 'NEET'
}

export interface IStudentProfile extends Document {
    user: string;
    grade: Grade;
    isDeleted: boolean;
    school: string;
    bio: string;
    awards: string[];
    targetExam: TargetExam;
    targetYear: number;
}

const studentProfileSchema = new Schema<IStudentProfile>({
    user: {
        type: String,
        required: true,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    grade: {
        type: String,
        enum: Object.values(Grade),
    },
    school: {
        type: String,
        trim: true,
        lowercase: true,
    },
    bio: {
        type: String,
        default: '',
    },
    awards: {
        type: [String],
        default: [],
    },
    targetExam: {
        type: String,
        enum: Object.values(TargetExam),
    },
    targetYear: {
        type: Number,
        validate: {
            validator: function (value: number) {
                const currentYear = new Date().getFullYear();
                return value > currentYear;
            },
            message: 'Target year must be greater than the current year.'
        }
    },
}, {
    timestamps: true
});

export const StudentProfiles = model<IStudentProfile>('tbl_student_profiles', studentProfileSchema);
