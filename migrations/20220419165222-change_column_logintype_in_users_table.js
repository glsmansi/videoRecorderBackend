"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Users", "loginType", {
      type: Sequelize.ENUM("login", "googleLogin"),
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Users", "loginType", {
      type: Sequelize.STRING,
    });
  },
};
