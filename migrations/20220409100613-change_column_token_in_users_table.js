"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Users", "token", {
      type: Sequelize.STRING(10000),
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Users", "token", {
      type: Sequelize.STRING,
    });
  },
};
