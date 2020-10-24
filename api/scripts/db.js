// const connectionString = require('../database')({ database: 'postgres' });
// const { Client } = require('pg')
// const client = new Client({ connectionString: connectionString })

const { createConnection } = require('typeorm')
const ormconfig = require('../ormconfig');

const commands = {
  create: async (connection) => {
    console.log(`creating database ${ormconfig.database}...`);
    await connection.query(`CREATE DATABASE ${ormconfig.database}`);
  },
  drop: async (connection) => {
    console.log(`dropping database ${ormconfig.database}...`);
    await connection.query(`DROP DATABASE ${ormconfig.database}`);
  }
}

const command = process.argv[2];
if (!command) {
  console.log('missing command')
  process.exit(1);
}
if (!commands[command]) {
  console.log(`invalid command: ${command}`);
  process.exit(1);
}

async function run() {
  let connection;
  try {
    const config = Object.assign({}, ormconfig, { database: 'postgres'});
    connection = await createConnection(config);
    //await connection.query(`CREATE DATABASE ${ormconfig.database}`);
    //await connection.connect();
    //await client.connect();
    await commands[command](connection);
  }
  catch(e) {
    console.log(e.message);
    process.exit(1);
  }
  finally {
    await connection.close();
  }
}

run();
