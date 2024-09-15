import { NextFunction, Request, Response } from "express";
import APIError from "../../../../errors/APIError";
import { USER_ERROR } from "../../../../errors/USER_ERRORS";
import { UserServices } from "./users.services";
import PreferencesServices from "../preferences/preferences.services";
import ProfileServices from "../profiles/profiles.services";

export class UsersController {
    /**
     * Verifies the user's account.
     * @param req - The request object containing the userId.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async verifyUser(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED)
            }
            const user = await UserServices.verifyUser(jwtUser.id);
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deactivates a user (soft delete).
     * @param req - The request object containing the userId.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async deactivateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED)
            }
            const user = await UserServices.deactivateUser(jwtUser.id, jwtUser.role);
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Activates a user (restores from soft delete).
     * @param req - The request object containing the userId.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async activateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED)
            }
            const user = await UserServices.activateUser(jwtUser.email, jwtUser.role);
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates a user profile.
     * @param req - The request object containing the userId and update fields.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED)
            }
            const updates = req.body;
            const user = await UserServices.updateUser(jwtUser.id, updates);
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Changes the user's profile image URL.
     * @param req - The request object containing the userId and new image URL.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async changeImageUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED)
            }
            const { newImageUrl } = req.body;
            const user = await UserServices.changeImageUrl(jwtUser.email, newImageUrl);
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Fetches a user by ID.
     * @param req - The request object containing the userId.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const user = await UserServices.getUserById(userId);
            if (!user) {
                throw new APIError(USER_ERROR.USER_NOT_FOUND_ERROR);
            }
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Fetches a user by ID.
     * @param req - The request object containing the userId.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async getUserByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const user = await UserServices.getUserByEmail(email);
            if (!user) {
                throw new APIError(USER_ERROR.USER_NOT_FOUND_ERROR);
            }
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Updates the user's preferences based on their role.
     * @param req - The request object containing the userId and preferences data.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async updatePreferences(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED);
            }

            const { role } = jwtUser;
            const preferencesPayload = req.body;

            const updatedPreferences = await PreferencesServices.updatePreferences(jwtUser.id, role, preferencesPayload);
            return res.status(200).json({ success: true, data: updatedPreferences });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Fetches the user's preferences based on their role.
     * @param req - The request object containing the userId.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async getPreferences(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED);
            }

            const { role } = jwtUser;
            const preferences = await PreferencesServices.getPreferences(jwtUser.id, role);

            return res.status(200).json({ success: true, data: preferences });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates the user's profile based on their role.
     * @param req - The request object containing the userId and profile data.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED);
            }

            const { role } = jwtUser;
            const profilePayload = req.body;

            const updatedProfile = await ProfileServices.updateProfile(jwtUser.id, role, profilePayload);
            return res.status(200).json({ success: true, data: updatedProfile });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Fetches the user's profile based on their role.
     * @param req - The request object containing the userId.
     * @param res - The response object.
     * @param next - The next middleware function.
     */
    static async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const jwtUser = req.user;
            if (!jwtUser) {
                throw new APIError(USER_ERROR.SESSION_INVALIDATED);
            }

            const { role } = jwtUser;
            const profile = await ProfileServices.getProfile(jwtUser.id, role);

            return res.status(200).json({ success: true, data: profile });
        } catch (error) {
            next(error);
        }
    }
}