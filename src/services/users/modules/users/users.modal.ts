import { Schema, model, Document } from 'mongoose';
import { StudentProfiles } from '../profiles/student.profile.modal';
import { StudentPreferences } from '../preferences/student.preferences.modal';
import { MentorProfiles } from '../profiles/mentor.profile.modal';
import { MentorPreferences } from '../preferences/mentor.preferences.modal';
import { InstituteProfiles } from '../profiles/institute.profile.modal';
import { InstitutePreferences } from '../preferences/institute.preferences.modal';
// import { StudentProfiles } from '../profiles/student.profile.modal';
// import { StudentPreferences } from '../preferences/student.preferences.modal';
// import { MentorProfiles } from '../profiles/mentor.profile.modal';
// import { MentorPreferences } from '../preferences/mentor.preferences.modal';
// import { InstituteProfiles } from '../profiles/institute.profile.modal';
// import { InstitutePreferences } from '../preferences/institute.preferences.modal';

export enum Permissions {
    READ = "read",
    WRITE = "write",
    UPDATE = "update",
    DELETE = "delete",
    ADMIN = "admin"
}

export enum UserRoles {
    STUDENT = 'student',
    MENTOR = 'mentor',
    INSTITUTE = 'institute',
}

export interface IUser extends Document {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    fullname: string;
    isVerified: boolean;
    role: UserRoles;
    imageUrl: string;
    isDeleted: boolean;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    username: {
        type: String,
        unique: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: Object.values(UserRoles),
        default: UserRoles.STUDENT
    },
    imageUrl: {
        type: String,
        default: null
    },
    fullname: {
        type: String,
        default: null
    },
    first_name: {
        type: String,
        default: null
    },
    last_name: {
        type: String,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    permissions: {
        type: [String],
        validate: {
            validator: function (permissions: string[]) {
                return permissions.every(validatePermission);
            },
            message: 'Invalid permission format. Each permission should be in the format resource:Permission where Permission is one of read, write, update, delete, or admin.'
        }
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            const role = this.role

            switch (role) {
                case UserRoles.STUDENT:
                    await StudentProfiles.create({ user: this._id })
                    await StudentPreferences.create({ user: this._id })
                    break;
                case UserRoles.MENTOR:
                    await MentorProfiles.create({ user: this._id })
                    await MentorPreferences.create({ user: this._id })
                    break;
                case UserRoles.INSTITUTE:
                    await InstituteProfiles.create({ user: this._id })
                    await InstitutePreferences.create({ user: this._id })
                    break;
                default:
                    break;
            }
        }

        if (this.first_name && this.last_name) {
            this.fullname = `${this.first_name} ${this.last_name}`;
        }

        next()
    } catch (error) {
        throw error
    }
});


function validatePermission(permission: string): boolean {
    const [resource, perm] = permission.split(':');
    return !!resource && Object.values(Permissions).includes(perm as Permissions);
}

export const Users = model<IUser>('tbl_users', userSchema);