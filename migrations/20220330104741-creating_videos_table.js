"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable("Videos", {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      fileName: {
        type: Sequelize.STRING(20),
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      sharedTo: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Videos");
  },
};
