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
      userEmail: {
        type: Sequelize.STRING(100),
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
