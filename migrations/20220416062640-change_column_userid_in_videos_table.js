"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Videos", "userId", {
      type: Sequelize.INTEGER(11),
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Videos", "userId", {
      type: Sequelize.STRING,
    });
  },
};
