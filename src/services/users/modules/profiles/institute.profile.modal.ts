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
    start: string; // Example: "09:00:00"
    end: string;   // Example: "17:00:00"
}

export interface IInstituteProfile extends Document {
    user: string;
    isDeleted: boolean;
    address: string;
    contact: {
        phone: string;
        email: string;
    };
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

const instituteProfileSchema = new Schema<IInstituteProfile>({
    user: {
        type: String,
        required: true,
        unique: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    address: {
        type: String,
        trim: true
    },
    contact: {
        phone: {
            type: String,
            validate: {
                validator: function (v: string) {
                    return /^(\+?[1-9]\d{1,14})$/.test(v);
                },
                message: 'Invalid phone number format.'
            }
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (v: string) {
                    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
                },
                message: 'Invalid email format.'
            }
        }
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

export const InstituteProfiles = model<IInstituteProfile>('tbl_institute_profiles', instituteProfileSchema);
