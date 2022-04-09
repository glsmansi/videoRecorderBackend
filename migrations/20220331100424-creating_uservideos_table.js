"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable("UserVideos", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      videoId: {
        type: Sequelize.INTEGER,
        references: { model: "Videos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable("UserVideos");
  },
};
