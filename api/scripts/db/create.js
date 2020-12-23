const run = require("./run");

run(async (connection, config) => {
  await connection.query(`CREATE DATABASE ${config.database}`);
});
