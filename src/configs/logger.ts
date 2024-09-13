import * as fs from "fs";
import * as path from "path";
import * as log4js from "log4js";

const logDir = path.resolve(__dirname, "../../logs");

if (!fs.existsSync(logDir)) {
    try {
        fs.mkdirSync(logDir, { recursive: true });
    } catch (err) {
        throw err
    }
}

log4js.configure({
    appenders: {
        out: { type: "stdout", layout: { type: "colored" } },
        errorlogs: {
            type: "file",
            filename: path.join(logDir, "error.log"),
            layout: { type: "colored" },
        },
        warnlogs: {
            type: "file",
            filename: path.join(logDir, "warn.log"),
            layout: { type: "colored" },
        },
        debuglogs: {
            type: "file",
            filename: path.join(logDir, "debug.log"),
            layout: { type: "colored" },
        },
        fatallogs: {
            type: "file",
            filename: path.join(logDir, "fatal.log"),
            layout: { type: "colored" },
        },
    },
    categories: {
        default: { appenders: ["out"], level: "info" },
        errorlogger: { appenders: ["errorlogs", "out"], level: "error" },
        warnLogger: { appenders: ["warnlogs", "out"], level: "warn" },
        debugLogger: { appenders: ["debuglogs", "out"], level: "debug" },
        fatalLogger: { appenders: ["fatallogs", "out"], level: "fatal" },
    },
});

export const logger = log4js.getLogger();
export const errorlogger = log4js.getLogger("errorlogger");
export const warnLogger = log4js.getLogger("warnLogger");
export const debugLogger = log4js.getLogger("debugLogger");
export const fatalLogger = log4js.getLogger("fatalLogger");
