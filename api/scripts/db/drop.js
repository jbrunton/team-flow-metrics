const run = require("./run");

run(async (connection, config) => {
  await connection.query(`DROP DATABASE ${config.database}`);
});
