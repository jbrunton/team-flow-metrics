# Getting Started

## Configuration

Make a copy of the example .env file:

```
cp default.env .env
```

Then complete the relevant configuration details for your Jira domain and user in the `.env` file.

## Running the app

First time setup:

```
npm install
NODE_ENV=development npm run db:migrate
```

Then, to run the app:

```
docker-compose up
```

You should find the app running at http://localhost:3001/.

# Syncing data

Currently you need to navigate to http://localhost:3001/api/sync. You can watch the progress in the logs. This will be improved in future.

# Development

## Running tests

You can run unit tests locally with `npx lerna run test:unit`, or simply with `jest` from the relevant package directory.

API integration tests require a database and docker. Run `npx lerna run test:integration` from the root directory. (You'll need to run `NODE_ENV=test npm run db:setup` the first time.)

## Database migrations

See the `db:*` commands in the root package. Note that you can run `npm run db:reset` to recreate the database at any point.