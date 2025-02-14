"use strict";

module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define("Question", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    gameId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    equation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correctAnswer: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    playerAnswer: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    timeStarted: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timeAnswered: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    timeTaken: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  });

  Question.associate = function (models) {
    Question.belongsTo(models.Game, {
      foreignKey: "gameId",
      as: "game",
      onDelete: "CASCADE",
    });
  };

  return Question;
};
