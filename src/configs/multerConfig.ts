import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';

const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

const allowedFileTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];


const UPLOAD_FOLDER = path.join(__dirname, '..', 'uploads');

if (!existsSync(UPLOAD_FOLDER)) {
    mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only CSV and XLSX files are allowed.')); // Reject the file
    }
};

// Multer config
const upload = multer({
    storage: storage,
    limits: {
        fileSize: FILE_SIZE_LIMIT // Limit the file size
    },
    fileFilter: fileFilter // Apply the file type filter
});

// Export the configuration
export { upload };
