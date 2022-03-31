"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Videos", "status", {
      type: Sequelize.ENUM("public", "private"),
      defaultValue: "public",
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.changeColumn("Videos", "status", {
      type: Sequelize.STRING,
    });
  },
};
