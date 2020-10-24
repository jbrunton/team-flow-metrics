const run = require('./run');

run(async (connection, config) => {
  console.log(`creating database ${config.database}...`);
  await connection.query(`CREATE DATABASE ${config.database}`);
});
