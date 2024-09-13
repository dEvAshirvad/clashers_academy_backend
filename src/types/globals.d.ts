import { UserRoles } from "@/services/authentication/users/users.model";
import DataLoader from "dataloader";
import { Request } from "express";

export interface JWTPayload {
    id: string;
    email: string;
    role: UserRoles;
    isVerified: boolean;
    imageUrl?: string;
    collection: "users";
}

export interface PaginatedResult<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    nextPage: boolean;
    prevPage: boolean;
}

export interface DeviceInfo {
    type: "Desktop" | "Mobile" | "Tablet";
    os: string;
    browser: string;
}

declare module "express" {
    interface Request {
        categoryLoader?: DataLoader
        user?: JWTPayload;
        device?: DeviceInfo;
    }
}