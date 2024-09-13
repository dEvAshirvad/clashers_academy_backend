import cookieParser from "cookie-parser";
import express, { Express } from "express";
import cors from "cors"
import useragent from 'express-useragent';
import { deviceInfoMiddleware } from "./handlers/deviceInfoMiddleware";
import UserDeserializer from "./handlers/userDeserialiser";
import Respond from "./lib/Respond";
import router from "./services";
import { errorHandler } from "./handlers/errorHandler";
import { attachDataLoaders } from "./handlers/attachDataloader";

const allowedOrigins = ["http://localhost:3000"];

export default function serverConfig(app: Express) {
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true, limit: "2048mb" }));
    app.use(express.json({ limit: "2048mb" }));
    app.use(
        cors({
            credentials: true,
            origin: function (origin, callback) {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
        })
    );

    app.use(attachDataLoaders)
    app.use(useragent.express())

    app.use((_, res, next) => {
        res.cookie("lang", "en");
        next();
    });

    app.use(deviceInfoMiddleware)
    app.use(UserDeserializer)

    app.get("/", (_, res) => {
        return Respond(res, { message: "API services are nominal!!" }, 200)
    });

    app.use(router)

    app.use(errorHandler);
}