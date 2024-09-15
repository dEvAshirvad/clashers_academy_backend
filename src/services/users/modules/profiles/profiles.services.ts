import { UserRoles } from "../users/users.modal";
import { IInstituteProfile, InstituteProfiles } from "./institute.profile.modal";
import { IMentorProfile, MentorProfiles } from "./mentor.profile.modal";
import { IStudentProfile, StudentProfiles } from "./student.profile.modal";

export default class ProfileServices {
    // Define allowed fields for each role to control which fields can be updated
    private static allowedFields = {
        [UserRoles.STUDENT]: ['grade', 'school', 'bio', 'awards', 'targetExam', 'targetYear'],
        [UserRoles.MENTOR]: ['expertise', 'bio', 'availability'],
        [UserRoles.INSTITUTE]: ['address', 'contactNumber', 'bio'],
    };

    /**
     * Filters the payload based on the allowed fields for the given role.
     * This ensures that only permitted fields are updated.
     * 
     * @param payload - The data to be updated.
     * @param role - The role of the user, which determines which fields are allowed.
     * @returns A filtered payload containing only the allowed fields.
     */
    private static filterPayloadByRole<T extends IStudentProfile | IInstituteProfile | IMentorProfile>(
        payload: Partial<T>,
        role: UserRoles.INSTITUTE | UserRoles.MENTOR | UserRoles.STUDENT
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
     * Updates a user's profile based on their role, allowing only specific fields to be updated.
     * 
     * @param userId - The ID of the user whose profile is being updated.
     * @param role - The role of the user, which determines which profile to update.
     * @param payload - The data to be updated.
     * @returns The updated profile or null if not found.
     */
    static async updateProfile<T extends IStudentProfile | IInstituteProfile | IMentorProfile>(
        userId: string,
        role: UserRoles.INSTITUTE | UserRoles.MENTOR | UserRoles.STUDENT,
        payload: Partial<T>
    ): Promise<T | null> {
        const filteredPayload = this.filterPayloadByRole(payload, role);

        // Update the corresponding profile based on the user's role
        if (role === UserRoles.STUDENT) {
            return await StudentProfiles.findOneAndUpdate({ user: userId }, filteredPayload, { new: true });
        } else if (role === UserRoles.MENTOR) {
            return await MentorProfiles.findOneAndUpdate({ user: userId }, filteredPayload, { new: true });
        } else if (role === UserRoles.INSTITUTE) {
            return await InstituteProfiles.findOneAndUpdate({ user: userId }, filteredPayload, { new: true });
        } else {
            throw new Error('Invalid role');
        }
    }

    /**
     * Retrieves a user's profile based on their role.
     * 
     * @param userId - The ID of the user whose profile is being retrieved.
     * @param role - The role of the user, which determines which profile to retrieve.
     * @returns The user's profile document or null if not found.
     */
    static async getProfile<T extends IStudentProfile | IMentorProfile | IInstituteProfile>(
        userId: string,
        role: UserRoles
    ) {
        try {
            switch (role) {
                case UserRoles.STUDENT:
                    return await StudentProfiles.findOne({ user: userId }) as T;
                case UserRoles.MENTOR:
                    return await MentorProfiles.findOne({ user: userId }) as T;
                case UserRoles.INSTITUTE:
                    return await InstituteProfiles.findOne({ user: userId }) as T;
                default:
                    throw new Error(`Invalid role: ${role}`);
            }
        } catch (error) {
            throw error;
        }
    }
}
