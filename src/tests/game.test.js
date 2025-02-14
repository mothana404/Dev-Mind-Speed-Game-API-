const request = require("supertest");
const app = require("../server");
const { sequelize } = require("../models");
const db = require("../models");
const { Game, Player, Question } = db;

describe("Dev-Mind-Speed-Game-API", () => {
  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
    } catch (error) {
      console.log("Error syncing the database:", error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await Player.destroy({ where: { name: "TestPlayer" } });
      await sequelize.close();
    } catch (error) {
      console.log(error);
    }
  });

  describe("POST /game/start", () => {
    it("Should Start a New Game", async () => {
      const response = await request(app).post("/game/start").send({
        name: "TestPlayer",
        difficulty: 3,
      });

      const timeRegex = /^(0[1-9]|1[0-2]):([0-5][0-9]):([0-5][0-9]) (AM|PM)$/;

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBeTruthy();
      expect(response.body.message).toBe(
        "Hello TestPlayer, find your submit API URL below"
      );

      expect(response.body).toHaveProperty("submit_url");
      expect(response.body.submit_url).toBeTruthy();
      expect(typeof response.body.submit_url).toBe("string");

      expect(response.body).toHaveProperty("question");
      expect(response.body.question).toBeTruthy();

      expect(response.body).toHaveProperty("time_started");
      expect(response.body.time_started).toBeTruthy();
      expect(timeRegex.test(response.body.time_started)).toBe(true);
    });

    it("should return 400 for invalid difficulty", async () => {
      const response = await request(app).post("/game/start").send({
        name: "TestPlayer",
        difficulty: 5,
      });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe(
        "Invalid inputs name and difficulty (from 1 to 4) are required."
      );
    });

    it("should return 400 for invalid name", async () => {
      const response = await request(app).post("/game/start").send({
        name: null,
        difficulty: 1,
      });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe(
        "Invalid inputs name and difficulty (from 1 to 4) are required."
      );
    });
  });

  describe("POST /game/:game_id/submit", () => {
    let gameId;

    beforeEach(async () => {
      const player = await Player.findOne({
        where: {
          name: "TestPlayer",
        },
      });

      const game = await Game.create({
        playerId: player.id,
        difficulty: 1,
      });

      await Question.create({
        gameId: game.id,
        equation: "2 + 2",
        correctAnswer: 4,
        timeStarted: new Date(),
      });

      gameId = game.id;
    });

    it("should submit answer successfully", async () => {
      const response = await request(app).post(`/game/${gameId}/submit`).send({
        answer: 4,
      });

      const timeTakenRegex = /^\d+(\.\d+)?s$/;
      const percentageRegex = /^\d+(\.\d+)?%$/;

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toBe(
        "Good job TestPlayer, your answer is correct!"
      );

      expect(response.body).toHaveProperty("time_taken");
      expect(timeTakenRegex.test(response.body.time_taken)).toBe(true);

      expect(response.body).toHaveProperty("current_score");
      expect(percentageRegex.test(response.body.current_score)).toBe(true);

      expect(response.body).toHaveProperty("history");
      response.body.history.forEach((item) => {
        expect(typeof item.question).toBe("string");
        expect(typeof item.playerAnswer).toBe("number");
        expect(typeof item.correctAnswer).toBe("number");
        expect(typeof item.timeTaken).toBe("number");
        expect(typeof item.isCorrect).toBe("boolean");
      });
    });

    it("should return 404 for non-existent game", async () => {
      const response = await request(app).post("/game/12345/submit").send({
        answer: 4,
      });
      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("The game is not found!");
    });

    it("should return 404 for null answer game", async () => {
      const response = await request(app).post("/game/12345/submit").send({
        answer: null,
      });
      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("You need to write an answer!");
    });
  });

  describe("GET /game/:game_id/status", () => {
    let gameId;

    beforeEach(async () => {
      const player = await Player.findOne({
        where: {
          name: "TestPlayer",
        },
      });

      const game = await Game.create({
        playerId: player.id,
        difficulty: 1,
      });

      gameId = game.id;
    });

    it("should get game status successfully", async () => {
      const response = await request(app).get(`/game/${gameId}/status`);

      const percentageRegex = /^\d+(\.\d+)?%$/;
      const timeTakenRegex = /^\d+(\.\d+)?s$/;

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty("name");
      expect(response.body.name).toBe("TestPlayer");

      expect(response.body).toHaveProperty("difficulty");
      expect(typeof response.body.difficulty).toBe("number");
      expect(response.body.difficulty).toBeGreaterThan(0);
      expect(response.body.difficulty).toBeLessThan(5);

      expect(response.body).toHaveProperty("current_score");
      expect(percentageRegex.test(response.body.current_score)).toBe(true);

      expect(response.body).toHaveProperty("total_time_spent");
      expect(timeTakenRegex.test(response.body.total_time_spent)).toBe(true);

      expect(response.body).toHaveProperty("history");
      response.body.history.forEach((item) => {
        expect(typeof item.question).toBe("string");
        expect(typeof item.playerAnswer).toBe("number");
        expect(typeof item.correctAnswer).toBe("number");
        expect(typeof item.timeTaken).toBe("number");
        expect(typeof item.isCorrect).toBe("boolean");
      });
    });

    it("should return 404 for non-existent game", async () => {
      const response = await request(app).get("/game/999/status");
      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Game is not found!");
    });
  });
});
