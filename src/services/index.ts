import { Router } from "express";
import cmsRouter from "./cms";

const router = Router();

router.use("/cms", cmsRouter)

export default router