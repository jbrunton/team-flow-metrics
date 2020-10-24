const run = require('./run');

run(async (connection, config) => {
  console.log(`dropping database ${config.database}...`);
  await connection.query(`DROP DATABASE ${config.database}`);
});
