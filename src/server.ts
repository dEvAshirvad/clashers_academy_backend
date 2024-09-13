import { config } from "dotenv";
import express from "express";
import serverConfig from "./serverConfigs";
import connectDB from "./configs/DB";
import { errorlogger, fatalLogger, logger } from "./configs/logger";

config()

const app = express()
const PORT = process.env.PORT || 3030

serverConfig(app)

connectDB()
    .then(() => {
        logger.info("Running Status", "Database connected");
    })
    .catch((err) => {
        errorlogger.error("Database Connection Failed", err);
        process.exit();
    });

const server = app.listen(PORT, () => {
    logger.info(
        "Running Status",
        `Server started on port http://localhost:${PORT}`
    );
});

process.on("unhandledRejection", (err) => {
    fatalLogger.fatal('Unhandled rejection', err);
    server.close(() => process.exit(1));
});