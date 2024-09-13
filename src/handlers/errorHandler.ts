import { NextFunction, Request, Response } from "express";
import APIError from "../errors/APIError";
import { errorlogger } from "../configs/logger";
import multer from "multer";

export function errorHandler(
    error: Error,
    _: Request,
    res: Response,
    next: NextFunction
) {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            throw new APIError({ STATUS: 400, TITLE: 'File size is too large. Maximum limit is 5 MB.' })
        }
        throw new APIError({ STATUS: 400, TITLE: 'MULTER_ERROR' })
    }

    if (error instanceof APIError) {
        return res.status(error.statusCode).json(error.serializeError());
    }



    errorlogger.error(error?.message)
    res.status(500).json({
        success: false,
        status: "error",
        title: "Internal Server Error",
        message: error?.message,
    });
    next();
}