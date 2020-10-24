const { createConnection } = require('typeorm')
const ormconfig = require('../../ormconfig');

async function run(command) {
  let connection;
  try {
    const config = Object.assign({}, ormconfig, { database: 'postgres'});
    connection = await createConnection(config);
    await command(connection, ormconfig);
  }
  catch(e) {
    console.log(e.message);
    process.exit(1);
  }
  finally {
    await connection.close();
  }
}

module.exports = run;
