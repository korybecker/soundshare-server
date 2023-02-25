const express = require("express");
const router = express.Router();

const requireAuth = require("../../../middleware/requireAuth");

module.exports = (soundService) => {
    router
        .get("/", soundService.getAllSounds)
        .get("/:soundId", soundService.getSound)
        .get("/user/:userId", soundService.getSoundsForUser)
        .post("/:soundId/like", requireAuth, soundService.like)
        .delete("/:soundId/unlike", requireAuth, soundService.unlike)
        .post("/", requireAuth, soundService.addSound)
        .patch("/:soundId", requireAuth, soundService.updateSound)
        .delete("/:soundId", requireAuth, soundService.deleteSound);

    return router;
};
