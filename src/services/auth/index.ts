import { Router } from "express";
import accountRouter from "./modules/accounts/accounts.router";

const authRouter = Router();

authRouter.use("/accounts", accountRouter)