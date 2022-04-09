"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Videos", "userId", {
      type: Sequelize.INTEGER,
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Videos", "userId", {
      type: Sequelize.INTEGER,
    });
  },
};
