import { NextFunction, Request, Response } from "express";
import { categoryLoader } from "../services/cms/modules/categories/categories.modal";

export const attachDataLoaders = (req: Request, res: Response, next: NextFunction) => {
    req.categoryLoader = categoryLoader;
    next();
};