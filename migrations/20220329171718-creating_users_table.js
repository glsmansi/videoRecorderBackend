"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable("Users", {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // username: {
      //   type: Sequelize.STRING(20),
      // },
      email: {
        type: Sequelize.STRING(20),
      },
      password: {
        type: Sequelize.STRING(100),
      },
      loginType: {
        type: Sequelize.STRING,
      },
      token: {
        type: Sequelize.STRING,
      },
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Users");
  },
};
