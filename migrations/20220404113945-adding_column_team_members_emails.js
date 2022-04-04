"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn("Videos", "teamMembers", {
      type: Sequelize.STRING(1000),
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Videos", "teamMembers");
  },
};
