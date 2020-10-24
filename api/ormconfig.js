if (!['development', 'test', 'production'].includes(process.env.NODE_ENV)) {
   throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}`);
}

module.exports = {
   "type": "postgres",
   "host": "localhost",
   "port": 5432,
   "username": "postgres",
   "password": "postgres",
   "database": `metrics_${process.env.NODE_ENV}`,
   "synchronize": false,
   "logging": process.env.NODE_ENV == 'development',
   "entities": [
      "models/entities/**/*.ts"
   ],
   "migrations": [
      "database/migrations/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
};
