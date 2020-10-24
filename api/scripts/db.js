const connectionString = require('../database')({ database: 'postgres' });
const { Client } = require('pg')
const client = new Client({ connectionString: connectionString })

const commands = {
  create: async (client) => {
    console.log('creating database test...');
    await client.query('CREATE DATABASE test');
  },
  drop: async (client) => {
    console.log('dropping database test...');
    await client.query('DROP DATABASE test');
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
  console.log('connecting to:', connectionString);

  try {
    await client.connect();
    await commands[command](client);
  }
  catch(e) {
    console.log(e.message);
    process.exit(1);
  }
  finally {
    await client.end();
  }

  console.log('done')
}

run();
