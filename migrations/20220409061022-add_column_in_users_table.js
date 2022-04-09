"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn("Users", "profilePicture", {
      type: Sequelize.STRING(1000),
      allowNull: true,
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Users", "profilePicture");
  },
};
