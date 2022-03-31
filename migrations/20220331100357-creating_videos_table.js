"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable("Videos", {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      fileName: {
        type: Sequelize.STRING(20),
      },
      url: {
        type: Sequelize.STRING,
      },
      userEmail: {
        type: Sequelize.STRING(20),
      },
      status: {
        type: Sequelize.STRING(20),
      },
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Videos");
  },
};
