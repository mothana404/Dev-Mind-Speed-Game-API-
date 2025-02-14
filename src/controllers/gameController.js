const { uuidv4 } = require("uuid");
const db = require("../models");
const { Game, Player, Question } = db;
const { generateEquation } = require("../utils/mathUtils");

exports.startGame = async (req, res) => {
  try {
    const { name, difficulty } = req.body;

    if (!name || !difficulty || difficulty < 1 || difficulty > 4) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid inputs name and difficulty (from 1 to 4) are required.",
      });
    }

    let player = await Player.findOne({ where: { name: name } });
    if (!player) {
      player = await Player.create({ name: name });
    }

    let game = await Game.findOne({
      where: {
        playerId: player.id,
        difficulty: difficulty,
      },
    });

    if (!game) {
      game = await Game.create({
        playerId: player.id,
        difficulty: difficulty,
      });
    }

    const { equation, answer } = generateEquation(difficulty);
    const question = await Question.create({
      gameId: game.id,
      equation: equation,
      correctAnswer: answer,
      timeStarted: new Date(),
    });

    const formattedTime = question.timeStarted.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecond: '2-digit',
      });

    return res.status(201).json({
      message: `Hello ${name}, find your submit API URL below`,
      submit_url: `/game/${game.id}/submit`,
      question: equation,
      time_started: formattedTime,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to start game" });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { game_id } = req.params;
    const { answer } = req.body;

    if (!answer) {
        return res.status(404).json({
          status: "error",
          message: "You need to write an answer!",
        });
      }

    const game = await Game.findByPk(game_id, {
      include: [
        {
          model: Player,
          as: "player",
        },
        {
          model: Question,
          as: "questions",
        },
      ],
    });

    if (!game) {
      return res.status(404).json({
        status: "error",
        message: "The game is not found!",
      });
    }

    const currentQuestion = await Question.findOne({
      where: {
        gameId: game_id,
        playerAnswer: null,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!currentQuestion) {
      return res.status(400).json({
        status: "error",
        message: "No question found",
      });
    }

    const timeAnswered = new Date();
    const timeTaken =
      (timeAnswered - new Date(currentQuestion.timeStarted)) / 1000;

    const isCorrect = Math.abs(currentQuestion.correctAnswer - answer) < 0.02;
    await currentQuestion.update({
      playerAnswer: answer,
      isCorrect: isCorrect,
      timeAnswered: timeAnswered,
      timeTaken: timeTaken,
    });

    const totalQuestions = await Question.count({ where: { gameId: game_id } });
    const correctAnswers = await Question.count({
      where: {
        gameId: game_id,
        isCorrect: true,
      },
    });

    const newScore = (await correctAnswers) / totalQuestions;
    await game.update({
      totalQuestionsAttempted: totalQuestions,
      correctAnswers: correctAnswers,
      currentScore: newScore,
    });

    await game.reload({
      include: [{ model: Question, as: "questions" }],
    });
    const history = await game.questions.map((question) => ({
      question: question.equation,
      playerAnswer: question.playerAnswer,
      correctAnswer: question.correctAnswer,
      timeTaken: question.timeTaken,
      isCorrect: question.isCorrect,
    }));

    const player = await Player.findByPk(game.playerId);
    return res.status(200).json({
      result: isCorrect
        ? `Good job ${player.name}, your answer is correct!`
        : `Sorry ${player.name}, your answer ${answer} is incorrect.`,
      time_taken: `${timeTaken.toFixed(1)}s`,
      current_score: `${(game.currentScore * 100).toFixed(1)}%`,
      history: history,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to submit answer",
    });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { game_id } = req.params;

    if (!game_id) {
      return res.status(404).json({
        status: "error",
        message: "You should send Game id!",
      });
    }

    const game = await Game.findByPk(game_id, {
      include: [
        {
          model: Player,
          as: "player",
        },
        {
          model: Question,
          as: "questions",
        },
      ],
    });

    if (!game) {
        return res.status(404).json({
          status: "error",
          message: "Game is not found!",
        });
      }

    const history = game.questions.map((question) => ({
      question: question.equation,
      player_answer: question.playerAnswer,
      correct_answer: question.correctAnswer,
      time_taken: question.timeTaken,
      is_correct: question.isCorrect,
    }));

    const total_time_spent = game.questions.reduce(
      (sum, question) => sum + (question.timeTaken || 0),
      0
    );

    return res.status(200).json({
      name: game.player.name,
      difficulty: game.difficulty,
      current_score: `${(game.currentScore * 100).toFixed(1)}%`,
      total_time_spent: `${total_time_spent}s`,
      history: history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get game status",
    });
  }
};
