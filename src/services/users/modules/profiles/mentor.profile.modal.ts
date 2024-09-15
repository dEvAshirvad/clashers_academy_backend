import { Schema, model, Document } from 'mongoose';

export enum DayOfWeek {
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
    SUNDAY = 'Sunday'
}

export interface TimeRange {
    start: string;
    end: string;
}

export enum Expertise {
    MATHEMATICS = 'Mathematics',
    PHYSICS = 'Physics',
    CHEMISTRY = 'Chemistry',
    BIOLOGY = 'Biology',
    // COMPUTER_SCIENCE = 'Computer Science',
    // ENGLISH = 'English',
    // OTHER = 'Other'
}

export interface IMentorProfile extends Document {
    user: string;
    isDeleted: boolean;
    expertise: Expertise[];
    bio: string;
    experience: number;
    qualifications: string[];
    availability: {
        days: DayOfWeek[];
        timeRange: TimeRange;
    };
}

// Define the TimeRange schema separately
const timeRangeSchema = new Schema<TimeRange>({
    start: {
        type: String,
        validate: {
            validator: function (v: string) {
                return /^\d{2}:\d{2}:\d{2}$/.test(v);
            },
            message: 'Invalid start time format.'
        },
    },
    end: {
        type: String,
        validate: {
            validator: function (v: string) {
                return /^\d{2}:\d{2}:\d{2}$/.test(v);
            },
            message: 'Invalid end time format.'
        },
    },
});

timeRangeSchema.path('end').validate(function (this: TimeRange, end: string) {
    const startTime = new Date(`1970-01-01T${this.start}Z`);
    const endTime = new Date(`1970-01-01T${end}Z`);
    return startTime < endTime;
}, 'End time must be after start time.');

const mentorProfileSchema = new Schema<IMentorProfile>({
    user: {
        type: String,
        required: true,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    expertise: {
        type: [String],
        enum: Object.values(Expertise),
    },
    bio: {
        type: String,
        default: '',
    },
    experience: {
        type: Number,
        min: 0 // Ensure experience is a non-negative number
    },
    qualifications: {
        type: [String],
        default: [],
    },
    availability: {
        days: {
            type: [String],
            enum: Object.values(DayOfWeek),
        },
        timeRange: timeRangeSchema, // Use the separate TimeRange schema
    }
}, {
    timestamps: true
});

export const MentorProfiles = model<IMentorProfile>('tbl_mentor_profiles', mentorProfileSchema);
