"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn("Videos", "userId", "userId");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn("Videos", "userId", "userId");
  },
};
