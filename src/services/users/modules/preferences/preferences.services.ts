import { IStudentPreferences, StudentPreferences } from "./student.preferences.modal";
import { IMentorPreferences, MentorPreferences } from "./mentor.preferences.modal";
import { IInstitutePreferences, InstitutePreferences } from "./institute.preferences.modal";
import { UserRoles } from "../users/users.modal";

export default class PreferencesServices {
    // Define the allowed fields for each role's preferences
    private static allowedFields = {
        [UserRoles.STUDENT]: ['language'],
        [UserRoles.MENTOR]: ['language'],
        [UserRoles.INSTITUTE]: ['language'],
    };

    /**
     * Filters the payload based on the allowed fields for the given role.
     * @param payload - The input payload with potential preference fields.
     * @param role - The role of the user.
     * @returns The filtered payload containing only allowed fields.
     */
    private static filterPayloadByRole<T extends IStudentPreferences | IMentorPreferences | IInstitutePreferences>(
        payload: Partial<T>,
        role: UserRoles
    ): Partial<T> {
        const allowedFields = this.allowedFields[role];
        const filteredPayload = {} as Partial<T>;

        for (const key in payload) {
            if (allowedFields.includes(key)) {
                filteredPayload[key as keyof T] = payload[key];
            }
        }

        return filteredPayload;
    }

    /**
     * Updates the preferences for the user based on their role.
     * @param userId - The ID of the user.
     * @param role - The role of the user.
     * @param payload - The updated preferences data.
     * @returns The updated preferences document.
     */
    static async updatePreferences<T extends IStudentPreferences | IMentorPreferences | IInstitutePreferences>(
        userId: string,
        role: UserRoles,
        payload: Partial<T>
    ): Promise<T | null> {
        const filteredPayload = this.filterPayloadByRole(payload, role);

        switch (role) {
            case UserRoles.STUDENT:
                return await StudentPreferences.findOneAndUpdate({ user: userId }, filteredPayload, { new: true });
            case UserRoles.MENTOR:
                return await MentorPreferences.findOneAndUpdate({ user: userId }, filteredPayload, { new: true });
            case UserRoles.INSTITUTE:
                return await InstitutePreferences.findOneAndUpdate({ user: userId }, filteredPayload, { new: true });
            default:
                throw new Error('Invalid role');
        }
    }

    /**
     * Get a user's preferences based on their role.
     * @param userId - The ID of the user.
     * @param role - The role of the user.
     * @returns The user's preferences document.
     */
    static async getPreferences(userId: string, role: UserRoles): Promise<any> {
        try {
            switch (role) {
                case UserRoles.STUDENT:
                    return await StudentPreferences.findOne({ user: userId });
                case UserRoles.MENTOR:
                    return await MentorPreferences.findOne({ user: userId });
                case UserRoles.INSTITUTE:
                    return await InstitutePreferences.findOne({ user: userId });
                default:
                    throw new Error(`Invalid role: ${role}`);
            }
        } catch (error) {
            throw error;
        }
    }
}
