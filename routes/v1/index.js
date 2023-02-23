const express = require("express");
const router = express.Router();

const usersRoute = require("./users");
const soundsRoute = require("./sounds");
const likesRoute = require("./likes");

// const requireAuth = require('../middleware/requireAuth');

module.exports = (params) => {
    router.get("/", (req, res) => {
        res.send("<h1>Home Page</h1>");
    });

    // // add require auth middleware to router
    // router.use(requireAuth);

    // hook all routes to router
    router.use("/user", usersRoute(params.userService));
    router.use("/sound", soundsRoute(params.soundService));
    router.use("/like", likesRoute(params.likeService));

    return router;
};
