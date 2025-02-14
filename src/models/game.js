"use strict";

module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define("Game", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4,
      },
    },
    currentScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalQuestionsAttempted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    correctAnswers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  Game.associate = function (models) {
    Game.belongsTo(models.Player, {
      foreignKey: "playerId",
      as: "player",
      onDelete: "CASCADE",
    });
    Game.hasMany(models.Question, {
      foreignKey: "gameId",
      as: "questions",
      onDelete: "CASCADE",
    });
  };

  return Game;
};
