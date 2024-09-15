import { Router } from "express";
import cmsRouter from "./cms";
import usersRouter from "./users/modules/users/users.router";

const router = Router();

router.use("/cms", cmsRouter)
router.use("/users", usersRouter)

export default router