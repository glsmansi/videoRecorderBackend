"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn("Users", "token", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Users", "token");
  },
};
