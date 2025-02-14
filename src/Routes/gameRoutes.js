const express = require("express");
const gameController = require("../controllers/gameController");

const router = express.Router();

router.post("/start", gameController.startGame);
router.post("/:game_id/submit", gameController.submitAnswer);
router.get("/:game_id/status", gameController.getStatus);

module.exports = router;
