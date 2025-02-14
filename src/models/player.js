"use strict";

module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define("Player", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalGamesPlayed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    bestScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  });

  Player.associate = function (models) {
    Player.belongsTo(models.Game, {
      foreignKey: "playerId",
      as: "games",
      onDelete: "CASCADE",
    });
  };

  return Player;
};
