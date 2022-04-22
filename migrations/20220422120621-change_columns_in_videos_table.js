("use strict");

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn("Videos", "title", {
        type: Sequelize.STRING(255),
      }),
      queryInterface.changeColumn("Videos", "notes", {
        type: Sequelize.TEXT("long"),
      }),
    ]);
  },

  down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn("Videos", "title", {
        type: Sequelize.STRING(100),
      }),
      queryInterface.changeColumn("Videos", "notes", {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
