const configs = {
  development: {
    database: 'test',
    username: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: '5432'
  }
}

module.exports = (opts) => {
  const config = configs[process.env.NODE_ENV];

  if (!config) {
    if (!process.env.NODE_ENV) {
      throw new Error("NODE_ENV not set")
    }
    throw new Error(`Could not find config for ${process.env.NODE_ENV}`)
  }  

  const database = opts.database || config.database;

  return `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${database}`;
}
