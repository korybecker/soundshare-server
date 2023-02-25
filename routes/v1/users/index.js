const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const requireAuth = require("../../../middleware/requireAuth");

module.exports = (userService) => {
    router
        .post("/login", userService.loginUser)
        .post("/signup", upload.single("file"), userService.signupUser)
        .get("/login", (req, res) => {
            res.send("joe mama");
        })
        .get("/:username", userService.getUser)
        .delete("/:userId", requireAuth, userService.deleteUser);

    return router;
};
