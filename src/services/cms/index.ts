import { Router } from "express";
import questionRouter from "./modules/questions/questions.router";
import categoryRouter from "./modules/categories/categories.router";

const cmsRouter = Router();

cmsRouter.use("/questions", questionRouter)
cmsRouter.use("/categories", categoryRouter)

export default cmsRouter