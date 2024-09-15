import { compare, hash } from "bcrypt";
import APIError from "../../../../errors/APIError";
import { USER_ERROR } from "../../../../errors/USER_ERRORS";
import { IUser, UserRoles, Users } from "./users.modal";
import { Accounts, Providers } from "../../../auth/modules/accounts/accounts.modal";
import { isAfter, subDays } from "date-fns";
import { StudentProfiles } from "../profiles/student.profile.modal";
import { StudentPreferences } from "../preferences/student.preferences.modal";
import { MentorProfiles } from "../profiles/mentor.profile.modal";
import { MentorPreferences } from "../preferences/mentor.preferences.modal";
import { InstituteProfiles } from "../profiles/institute.profile.modal";
import { InstitutePreferences } from "../preferences/institute.preferences.modal";

interface UserRegistrationParams {
    email: string,
    password: string | null,
    provider: Providers,
    providerId?: string,
    imageUrl?: string,
    role?: UserRoles
}

export class UserServices {
    /**
     * Registers a new user and creates associated Profile and Preferences.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @param provider - The provider (e.g., 'local' for local authentication).
     * @param providerId - The provider-specific ID (used for OAuth providers).
    */
    static async registerUser({ email, password, provider, providerId, imageUrl, role = UserRoles.STUDENT }: UserRegistrationParams): Promise<IUser> {
        if (!email || !this.validateEmail(email)) {
            throw new APIError(USER_ERROR.INVALID_CREDENTIALS)
        }

        let hashedPassword: string | null = null;
        if (provider === 'local') {
            if (!password || password.length < 6) {
                throw new APIError(USER_ERROR.INVALID_CREDENTIALS)
            }
            hashedPassword = await hash(password, 10);
        }

        const user = await Users.create({ email, role, imageUrl });

        await Accounts.create({
            user: user._id,
            provider,
            providerId,
            password: hashedPassword,
        });

        return user;
    }
    /**
     * Reads a user by email.
     * @param email - The email address of the user.
     * @returns The user if found.
    */
    static async getUserByEmail(email?: string) {
        const user = await Users.findOne({ email }).exec();
        if (!user || user.isDeleted) {
            return false
        }
        return user;
    }
    /**
     * Verifies the user's account status based on the `isVerified` field.
     * @param userId - The user's ID.
     * @returns The updated user object after verification.
     */
    static async verifyUser(userId: string): Promise<IUser> {
        try {
            const user = await Users.findById(userId).exec();

            if (!user || user.isDeleted) {
                throw new Error('User not found or already deleted');
            }

            if (user.isVerified) {
                throw new Error('User is already verified');
            }

            user.isVerified = true;
            await user.save();

            return user;
        } catch (error) {
            throw error
        }
    }

    /**
     * Deactivates a user (soft delete).
     * @param userId - The ID of the user to deactivate.
     * @param role - The role of the user (STUDENT, MENTOR, INSTITUTE).
     * @returns The deactivated user.
     */
    static async deactivateUser(userId: string, role: UserRoles.STUDENT | UserRoles.MENTOR | UserRoles.INSTITUTE): Promise<IUser> {
        const user = await Users.findById(userId).exec();
        if (!user || user.isDeleted) {
            throw new Error('User not found or already deactivated');
        }

        // Soft delete user and associated records
        user.isDeleted = true;
        await user.save();

        await Accounts.updateMany({ user: userId }, { isDeleted: true });

        switch (role) {
            case UserRoles.STUDENT:
                await StudentProfiles.findOneAndUpdate({ user: userId }, { isDeleted: true });
                await StudentPreferences.findOneAndUpdate({ user: userId }, { isDeleted: true });
                break;
            case UserRoles.MENTOR:
                await MentorProfiles.findOneAndUpdate({ user: userId }, { isDeleted: true });
                await MentorPreferences.findOneAndUpdate({ user: userId }, { isDeleted: true });
                break;
            case UserRoles.INSTITUTE:
                await InstituteProfiles.updateMany({ user: userId }, { isDeleted: true });
                await InstitutePreferences.updateMany({ user: userId }, { isDeleted: true });
                break;
            default:
                throw new Error('Invalid user role');
        }

        return user;
    }

    /**
     * Activates a user (restores from soft delete).
     * @param email - The ID of the user to activate.
     * @param role - The role of the user (STUDENT, MENTOR, INSTITUTE).
     * @returns The activated user.
     */
    static async activateUser(email: string, role: UserRoles.STUDENT | UserRoles.MENTOR | UserRoles.INSTITUTE): Promise<IUser> {
        const user = await this.getUserByEmail(email)
        if (!user || !user.isDeleted) {
            throw new Error('User not found or not deactivated');
        }

        // Restore user and associated records
        user.isDeleted = false;
        await user.save();

        await Accounts.updateMany({ user: user.id }, { isDeleted: false });

        switch (role) {
            case UserRoles.STUDENT:
                await StudentProfiles.findOneAndUpdate({ user: user.id }, { isDeleted: false });
                await StudentPreferences.findOneAndUpdate({ user: user.id }, { isDeleted: false });
                break;
            case UserRoles.MENTOR:
                await MentorProfiles.findOneAndUpdate({ user: user.id }, { isDeleted: false });
                await MentorPreferences.findOneAndUpdate({ user: user.id }, { isDeleted: false });
                break;
            case UserRoles.INSTITUTE:
                await InstituteProfiles.updateMany({ user: user.id }, { isDeleted: false });
                await InstitutePreferences.updateMany({ user: user.id }, { isDeleted: false });
                break;
            default:
                throw new Error('Invalid user role');
        }

        return user;
    }

    /**
     * Reads a user by ID.
     * @param userId - The ID of the user.
     * @returns The user if found.
    */
    static async getUserById(userId: string) {
        const user = await Users.findById(userId).exec();
        if (!user || user.isDeleted) {
            return false
        }
        return user;
    }
    /**
     * Validates the email address format.
     * @param email - The email address to validate.
     * @returns True if the email is valid, false otherwise.
    */
    private static validateEmail(email: string): boolean {
        // Basic email validation regex
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Verifies if a given password matches the hashed password.
     * @param password - The password to verify.
     * @param hashedPassword - The hashed password to compare against.
     * @returns True if the password matches, false otherwise.
    */
    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return await compare(password, hashedPassword);
    }

    /**
     * Updates a user's profile fields if the update is within the allowed fields
     * and if the user hasn't updated in the last 30 days.
     * @param userId - The ID of the user to update.
     * @param updates - An object containing the fields to update.
     * @returns The updated user object.
     */
    static async updateUser(userId: string, updates: Partial<IUser>): Promise<IUser> {
        // Define the allowed fields for updates
        const allowedFields = ['fullname', 'last_name', 'first_name', 'username', 'email'];

        // Fetch the user to be updated
        const user = await Users.findById(userId).exec();
        if (!user || user.isDeleted) {
            throw new APIError(USER_ERROR.USER_NOT_FOUND_ERROR);
        }

        // Check if the user has updated within the last 30 days
        const lastUpdated = user.updatedAt;
        if (!isAfter(new Date(), subDays(new Date(lastUpdated), 30))) {
            throw new APIError({
                STATUS: 401,
                TITLE: "UPDATE_LIMIT_REACHED",
                MESSAGE: `Update limit reached. try after `,
            });
        }

        const updatesToApply: Partial<IUser> = {};
        for (const field of allowedFields) {
            if (updates[field as keyof IUser] !== undefined) {
                updatesToApply[field as keyof IUser] = updates[field as keyof IUser];
            }
        }

        if (Object.keys(updatesToApply).length === 0) {
            throw new APIError(USER_ERROR.INVALID_CREDENTIALS);
        }

        // Apply updates
        Object.assign(user, updatesToApply);

        // Save updated user
        await user.save();

        return user;
    }
    /**
     * Changes the user's profile image URL.
     * @param email - The email of the user to update.
     * @param newImageUrl - The new image URL to be set for the user.
     * @returns The updated user object.
     */
    static async changeImageUrl(email: string, newImageUrl: string): Promise<IUser> {
        const user = await Users.findOne({ email }).exec();
        if (!user || user.isDeleted) {
            throw new APIError(USER_ERROR.USER_NOT_FOUND_ERROR);
        }

        user.imageUrl = newImageUrl;

        await user.save();

        return user;
    }
}