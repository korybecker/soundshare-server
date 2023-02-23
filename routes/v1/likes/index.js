const express = require("express");
const router = express.Router();

const requireAuth = require("../../../middleware/requireAuth");

module.exports = (likeService) => {
    router.get("/:userId", requireAuth, likeService.getLikesForUser);

    return router;
};
