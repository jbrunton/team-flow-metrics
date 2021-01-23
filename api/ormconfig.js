if (!["development", "test", "production"].includes(process.env.NODE_ENV)) {
  throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}`);
}

const config = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || "postgres",
  port: process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: `metrics_${process.env.NODE_ENV}`,
  synchronize: false,
  logging: process.env.NODE_ENV == "development",
  entities: ["models/entities/**/*.ts"],
  migrations: ["database/migrations/**/*.ts"],
  subscribers: ["models/subscribers/**/*.ts"],
  cli: {
    entitiesDir: "models/entities",
    migrationsDir: "database/migrations",
    subscribersDir: "models/subscribers",
  },
};

module.exports = config;
