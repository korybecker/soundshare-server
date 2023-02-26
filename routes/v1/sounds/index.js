const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadUpdate = multer();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB
    },
});

const requireAuth = require("../../../middleware/requireAuth");

module.exports = (soundService) => {
    router
        .get("/", soundService.getAllSounds)
        .get("/:soundId", soundService.getSound)
        .get("/:soundId/download", soundService.downloadSound)
        .get("/user/:userId", soundService.getSoundsForUser)
        .post("/:soundId/like", requireAuth, soundService.like)
        .delete("/:soundId/unlike", requireAuth, soundService.unlike)
        .post("/", requireAuth, upload.single("file"), soundService.addSound)
        .patch(
            "/:soundId",
            uploadUpdate.single("storage"),
            requireAuth,
            soundService.updateSound
        )
        .delete("/:soundId", requireAuth, soundService.deleteSound);

    return router;
};
