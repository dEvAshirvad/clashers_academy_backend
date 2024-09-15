import mongoose, { Schema } from "mongoose";

export enum Providers {
    GOOGLE = "google",
    DISCORD = "discord",
    LOCAL = "local"
}

interface IAccount extends Document {
    user: string;
    provider: Providers,
    providerId?: string,
    password: string,
    isDeleted: boolean;
}

const accountSchema = new Schema<IAccount>({
    user: {
        type: String,
        trim: true,
        required: true,
        index: true
    },
    provider: {
        type: String,
        enum: Object.values(Providers),
        required: true,
    },
    providerId: {
        type: String,
    },
    password: {
        type: String,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

export const Accounts = mongoose.model<IAccount>('tbl_accounts', accountSchema);