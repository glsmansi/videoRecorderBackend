"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Users", "token");
  },

  down(queryInterface, Sequelize) {
    return queryInterface.addColumn("Users", "token", {
      type: Sequelize.STRING,
    });
  },
};
