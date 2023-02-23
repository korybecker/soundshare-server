const express = require("express");
const upload = require("express-fileupload");
const app = express();

const cors = require("cors");

const routesV1 = require("./routes/v1");

const UserService = require("./services/UserService");
const SoundService = require("./services/SoundService");
const LikeService = require("./services/LikeService");

const userService = new UserService();
const soundService = new SoundService();
const likeService = new LikeService();

module.exports = (config) => {
    const log = config.log();

    // Add a request logging middleware in development mode
    if (app.get("env") === "development") {
        app.use((req, res, next) => {
            log.debug(`${req.method}: ${req.url}`);
            return next();
        });
    }

    app.use(upload());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors());

    // use routes
    app.use("/api/v1/", routesV1({ userService, soundService, likeService }));

    app.get("/", (req, res) => {
        return res.json({
            message: "Welcome to the API",
        });
    });

    // error middleware
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        // Log out the error to the console
        log.error(err);
        return res.json({
            error: {
                message: err.message,
            },
        });
    });
    return app;
};
