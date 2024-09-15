import { Router } from "express";
import { UsersController } from "./users.controller";
import { requireUser } from "../../../../handlers/requireUser";

const usersRouter = Router();

/**
 * Route to verify the user's account.
 * Method: POST
 * URL: /users/verify
 */
usersRouter.post('/verify', UsersController.verifyUser);

/**
 * Route to deactivate (soft delete) a user.
 * Method: POST
 * URL: /users/deactivate
 */
usersRouter.post('/deactivate', requireUser, UsersController.deactivateUser);

/**
 * Route to activate (restore) a user.
 * Method: POST
 * URL: /users/activate
 */
usersRouter.post('/activate', UsersController.activateUser);

/**
 * Route to update a user's profile.
 * Method: PUT
 * URL: /users/update
 */
usersRouter.put('/update', requireUser, UsersController.updateUser);

/**
 * Route to change a user's profile image URL.
 * Method: PUT
 * URL: /users/change-image
 */
usersRouter.put('/change-image', requireUser, UsersController.changeImageUrl);

/**
 * Route to fetch a user by their ID.
 * Method: GET
 * URL: /users/:userId
 */
usersRouter.get('/:userId', requireUser, UsersController.getUserById);

/**
 * Route to fetch a user by their email.
 * Method: POST
 * URL: /users/email
 */
usersRouter.post('/email', requireUser, UsersController.getUserByEmail);

/**
 * Route to update user profile.
 * Method: PUT
 * URL: /users/profile/update
 */
usersRouter.put('/profile/update', requireUser, UsersController.updateProfile);

/**
 * Route to get user profile.
 * Method: GET
 * URL: /users/profile
 */
usersRouter.get('/profile', requireUser, UsersController.getProfile);


/**
 * Route to update user preferences.
 * Method: PUT
 * URL: /users/preferences/update
 */
usersRouter.put('/preferences/update', requireUser, UsersController.updatePreferences);

/**
 * Route to get user preferences.
 * Method: GET
 * URL: /users/preferences
 */
usersRouter.get('/preferences', requireUser, UsersController.getPreferences);

export default usersRouter;
