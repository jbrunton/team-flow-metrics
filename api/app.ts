const glob = require('glob');
const path = require('path');
const express = require('express')
const bodyParser = require('body-parser')

import "reflect-metadata";

const { createConnection } = require('typeorm')

export const createApp = async function configure() {
  const app = express()
  app.use(bodyParser.json());
  
  console.log('Configuring routers...');
  glob.sync('./routers/*_router.{js,ts}').forEach(function(file) {
    const { routerPath, router, environments } = require(path.resolve(file));
    const applyRouter = !environments || environments.includes(process.env.NODE_ENV);
    if (applyRouter) {
      console.log(`  Registering router ${file} at ${routerPath}`);
      app.use(routerPath, router);
    } else {
      console.log(`  Skipping router ${file} for environment ${process.env.NODE_ENV}`);
    }
  });

  console.log('Creating connection...');
  const connection = await createConnection();
  console.log(`Connected to ${connection.options.host}:${connection.options.port}/${connection.options.database}`);

  return app;
}
