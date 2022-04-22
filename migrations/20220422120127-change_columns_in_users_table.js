"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING(255),
      unique: true,
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING(100),
      unique: true,
    });
  },
};
