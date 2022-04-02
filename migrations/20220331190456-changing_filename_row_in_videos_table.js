"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Videos", "fileName", {
      type: Sequelize.STRING(100),
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Videos", "fileName", {
      type: Sequelize.STRING,
    });
  },
};
